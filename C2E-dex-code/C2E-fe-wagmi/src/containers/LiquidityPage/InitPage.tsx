import { useEffect, useMemo, useRef, useState } from "react";
import { InputNumber, Row, Col, Select } from "antd";
import { usePublicClient, useWalletClient } from "wagmi";

import { parseUnits, createViemContract } from "@src/lib/viem";
import { tokenAbi } from "@src/config";
import { useSwap } from "@src/hooks/useSwap";
import { useWallet } from "@src/hooks/useWallet";
import { useMessage } from "@src/hooks/useMessage";
import { formatUnits } from "@src/util/index";
import TransactionButton from "@src/components/elements/TransactionButton";

import styles from "./SwapPage.module.scss";

export function InitPage({ tokenUnits }) {
  const { walletAddress, chain } = useWallet();
  const { setSuccessMessage, setErrorMessage } = useMessage();
  const {
    pair,
    routerContract,
    token1Address,
    token2Address,
    setToken1Address,
    setToken2Address,
    getAllPairs,
    approveToRouter,
  } = useSwap({ noPairAlert: false });
  const publicClient = usePublicClient({ chainId: chain?.chainId });
  const { data: walletClient } = useWalletClient();

  const [fromNum, setFromNum] = useState<number>();
  const [toNum, setToNum] = useState<number>();
  const [fromUnitValue, setFromUnitValue] = useState<string>(tokenUnits[0].value);
  const [toUnit, setToUnit] = useState<string>(tokenUnits[1].value);
  const [exchangeStatus, setExchangeStatus] = useState(0);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [toBalance, setToBalance] = useState<bigint | null>(null);
  const [decimals, setDecimals] = useState(18);
  const waiting = useRef(false);

  const fromUnit = useMemo(
    () => tokenUnits.find((item) => item.value === fromUnitValue),
    [fromUnitValue, tokenUnits],
  );

  useEffect(() => {
    getToken1Balance();
  }, [token1Address, publicClient, walletClient]);

  useEffect(() => {
    getToken2Balance();
  }, [token2Address, publicClient, walletClient]);

  useEffect(() => {
    if (fromUnitValue === toUnit) {
      const index = tokenUnits.findIndex((item) => item.value === toUnit);
      setToUnit(index + 1 >= tokenUnits.length ? tokenUnits[0].value : tokenUnits[index + 1].value);
    }
  }, [fromUnitValue, toUnit, tokenUnits]);

  useEffect(() => {
    const tokenInfo = tokenUnits.find((item) => item.value === fromUnitValue);
    setToken1Address(tokenInfo?.contractAddress && tokenInfo.chainId === chain?.chainId ? tokenInfo.contractAddress : "");
  }, [fromUnitValue, chain, tokenUnits]);

  useEffect(() => {
    const tokenInfo = tokenUnits.find((item) => item.value === toUnit);
    setToken2Address(tokenInfo?.contractAddress && tokenInfo.chainId === chain?.chainId ? tokenInfo.contractAddress : "");
  }, [toUnit, chain, tokenUnits]);

  useEffect(() => {
    const tokenInfo = tokenUnits.find((item) => item.chainId === chain?.chainId);
    if (tokenInfo) {
      setFromUnitValue(tokenInfo.value);
    }
  }, [chain, tokenUnits]);

  async function getToken1Balance() {
    if (!fromUnit?.contractAddress || !publicClient) return;
    const tokenContract = createViemContract({
      address: fromUnit.contractAddress,
      abi: tokenAbi,
      publicClient,
      walletClient,
    });
    setBalance(await tokenContract.balanceOf(walletAddress));
    setDecimals(await tokenContract.decimals());
  }

  async function getToken2Balance() {
    if (!token2Address || !publicClient) return;
    const tokenContract = createViemContract({
      address: token2Address,
      abi: tokenAbi,
      publicClient,
      walletClient,
    });
    setToBalance(await tokenContract.balanceOf(walletAddress));
    setDecimals(await tokenContract.decimals());
  }

  async function onInitLiquidity() {
    if (!fromNum || !toNum) {
      setErrorMessage("Please input exchange token number");
      return;
    }
    if (Number(toNum) === 0 || Number(fromNum) === 0) {
      setErrorMessage("Insufficient liquidity");
      return;
    }
    if (pair) {
      setErrorMessage("Pair already exists");
      return;
    }

    setExchangeStatus(2);
    const amountADesired = parseUnits(fromNum.toString());
    const amountBDesired = parseUnits(toNum.toString());
    const amountAMin = (amountADesired * 99n) / 100n;
    const amountBMin = (amountBDesired * 99n) / 100n;

    const tx1 = await approveToRouter(token1Address, amountADesired);
    const tx2 = await approveToRouter(token2Address, amountBDesired);
    await Promise.all([tx1.wait(), tx2.wait()]);

    routerContract
      .addLiquidity(
        token1Address,
        token2Address,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        walletAddress,
        BigInt(Math.floor(Date.now() / 1000) + 60 * 10),
      )
      .then((tx) => tx.wait())
      .then(() => setSuccessMessage("Init liquidity success"))
      .catch((error) => {
        console.error(error);
        setErrorMessage("Init liquidity failed");
      })
      .finally(() => {
        setExchangeStatus(0);
        getAllPairs();
        setFromNum(0);
        setToNum(0);
      });
  }

  function debouncedOnClick() {
    if (waiting.current) return;
    waiting.current = true;
    onInitLiquidity().finally(() => {
      setTimeout(() => {
        waiting.current = false;
      }, 2000);
    });
  }

  return (
    <div className={styles["bridge-form"]}>
      <section className={styles.section}>
        <div>
          <h2 className={styles.title}>
            <Row>
              <Col>
                <span>Init Liquidity</span>
              </Col>
            </Row>
          </h2>

          <div style={{ marginBottom: "20px" }}>
            <div className="balance">
              Balance: {formatUnits(balance, 4, decimals)?.toFixed(8)} {fromUnit?.label}
            </div>
            <div className="balance">
              Balance: {formatUnits(toBalance, 4, decimals)?.toFixed(8)} {toUnit}
            </div>
          </div>

          <Row gutter={[16, 16]}>
            <div className={styles.input}>
              <InputNumber
                className={styles.number}
                value={fromNum}
                max={formatUnits(balance, 4, decimals)}
                step="0.0001"
                onChange={(value) => setFromNum(Number(value))}
                stringMode
                controls={false}
                bordered={false}
              />
              <Select
                bordered={false}
                className={styles.unit}
                value={fromUnitValue}
                options={tokenUnits}
                onChange={(value) => {
                  if (value === toUnit) setToUnit(fromUnitValue);
                  setFromUnitValue(value);
                }}
              />
            </div>
            <div className={styles.input} style={{ marginBottom: "20px" }}>
              <InputNumber
                className={styles.number}
                value={toNum}
                max={formatUnits(toBalance, 4, decimals)}
                step="0.0001"
                stringMode
                min={0}
                controls={false}
                bordered={false}
                onChange={(value) => setToNum(Number(value))}
              />
              <Select
                bordered={false}
                className={styles.unit}
                value={toUnit}
                options={tokenUnits}
                onChange={(value) => {
                  if (value === fromUnitValue) setFromUnitValue(toUnit);
                  setToUnit(value);
                }}
              />
            </div>
            <TransactionButton
              className="button"
              onClick={debouncedOnClick}
              noConnectText="Connect wallet to exchange"
              style={{ width: "100%" }}
              loading={![0, 1].includes(exchangeStatus)}
              loadingText={exchangeStatus === 2 ? "Waiting Tx..." : "Please wait..."}
              requiredChainId={chain?.chainId}
              switchNetworkText="Switch Network to Exchange"
            >
              Init Liquidity
            </TransactionButton>
          </Row>
        </div>
      </section>
    </div>
  );
}
