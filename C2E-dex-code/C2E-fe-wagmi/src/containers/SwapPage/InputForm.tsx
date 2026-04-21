import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePublicClient, useWalletClient } from "wagmi";
import { InputNumber, Row, Col, Select } from "antd";

import { useSwap } from "@src/hooks/useSwap";
import { useWallet } from "@src/hooks/useWallet";
import { useMessage } from "@src/hooks/useMessage";
import { useResponsive } from "@src/hooks/useResponsive";
import { createViemContract, parseUnits } from "@src/lib/viem";
import { tokenAbi } from "@src/config";
import { formatUnits } from "@src/util/index";
import { IconSwitch } from "@src/components/icons";
import BasicButton from "@src/components/elements/Button.Basic";
import TransactionButton from "@src/components/elements/TransactionButton";

import styles from "./SwapPage.module.scss";

export function InputForm({ tokenUnits, available }) {
  const { walletAddress, chain } = useWallet();
  const { setSuccessMessage, setErrorMessage } = useMessage();
  const { isDesktopOrLaptop } = useResponsive();
  const {
    getAmountsOut,
    routerContract,
    token1Address,
    token2Address,
    setToken1Address,
    setToken2Address,
    pair,
    approveToRouter,
  } = useSwap();
  const publicClient = usePublicClient({ chainId: chain?.chainId });
  const { data: walletClient } = useWalletClient();
  const router = useRouter();

  const [fromNum, setFromNum] = useState<number>();
  const [toNum, setToNum] = useState<number>();
  const [fromUnitValue, setFromUnitValue] = useState<string>(tokenUnits[0].value);
  const [toUnit, setToUnit] = useState<string>(tokenUnits[1].value);
  const [exchangeStatus, setExchangeStatus] = useState(0);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [toBalance, setToBalance] = useState<bigint | null>(null);
  const [decimals, setDecimals] = useState(18);
  const waiting = useRef(false);
  const quoteTimer = useRef<any>();

  const fromUnit = useMemo(
    () => tokenUnits.find((item) => item.value === fromUnitValue),
    [fromUnitValue, tokenUnits],
  );

  useEffect(() => {
    if (token1Address && token2Address && fromNum && pair) {
      clearInterval(quoteTimer.current);
      quoteTimer.current = setInterval(() => {
        updateAmountsOut();
        getBalance();
      }, 1000);
    }

    return () => clearInterval(quoteTimer.current);
  }, [fromNum, pair, token1Address, token2Address]);

  useEffect(() => {
    if (!publicClient) return;
    getBalance();
  }, [fromUnit?.contractAddress, publicClient, walletClient]);

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

  async function getBalance() {
    if (!fromUnit?.contractAddress || !publicClient) return;

    const tokenContract = createViemContract({
      address: fromUnit.contractAddress,
      abi: tokenAbi,
      publicClient,
      walletClient,
    });
    setBalance(await tokenContract.balanceOf(walletAddress));
    setDecimals(await tokenContract.decimals());

    const toContractAddress = tokenUnits.find((item) => item.value === toUnit)?.contractAddress;
    if (!toContractAddress) return;

    const toContract = createViemContract({
      address: toContractAddress,
      abi: tokenAbi,
      publicClient,
      walletClient,
    });
    setToBalance(await toContract.balanceOf(walletAddress));
  }

  function updateAmountsOut() {
    if (!fromNum || Number(fromNum.toFixed(8)) === 0) return;
    getAmountsOut({ token1Address, token2Address, tokenInAmount: fromNum }).then((data) => {
      setToNum(Number(Number(data.token2Amount).toFixed(8)));
    });
  }

  async function onSwapButtonClick() {
    if (!fromNum) {
      setErrorMessage("Please input exchange token number");
      return;
    }
    if (toNum === 0) {
      setErrorMessage("Insufficient liquidity");
      return;
    }

    const amountIn = parseUnits(fromNum.toString(), decimals);
    await approveToRouter(token1Address, amountIn);
    setExchangeStatus(2);

    routerContract
      .swapExactTokensForTokens(
        amountIn,
        0n,
        [token1Address, token2Address],
        walletAddress,
        BigInt(Math.floor(Date.now() / 1000) + 60 * 10),
      )
      .then((tx) => tx.wait())
      .then(() => {
        setExchangeStatus(0);
        setSuccessMessage("Exchange success");
      })
      .catch((error) => {
        setExchangeStatus(0);
        console.error(error);
        setErrorMessage("Exchange failed");
      })
      .finally(updateAmountsOut);
  }

  function debouncedOnSwapButtonClick() {
    if (!pair) {
      router.push("/liquidity");
      return;
    }

    if (waiting.current) return;
    waiting.current = true;
    onSwapButtonClick().finally(() => {
      setTimeout(() => {
        waiting.current = false;
      }, 2000);
    });
  }

  function onSwitchButtonClick() {
    setFromUnitValue(toUnit);
    setToUnit(fromUnitValue);
    setToken1Address(token2Address);
    setToken2Address(token1Address);
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col span={isDesktopOrLaptop ? 8 : 24}>
          <Row justify="space-between">
            <div className="balance">
              Balance: {formatUnits(balance, 4, decimals)?.toFixed(8)} {fromUnit?.label}
            </div>
          </Row>
          <Row justify="space-between">
            <div className="balance">
              Balance: {formatUnits(toBalance, 4, decimals)?.toFixed(8)} {toUnit}
            </div>
          </Row>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={isDesktopOrLaptop ? 8 : 24}>
          <Row justify="start" wrap={false}>
            <span className={styles["input-label"]}>Sell:</span>
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
          </Row>
        </Col>
        {!isDesktopOrLaptop ? (
          <Col span={24} style={{ textAlign: "right" }}>
            <BasicButton
              className={["button", styles["switch-button"]].join(" ")}
              style={{ width: "69px", verticalAlign: "top", lineHeight: "60px" }}
              onClick={onSwitchButtonClick}
            >
              <IconSwitch style={{ transform: "rotate(90deg)" }} />
            </BasicButton>
          </Col>
        ) : null}
        <Col span={isDesktopOrLaptop ? 8 : 24}>
          <Row justify="start" wrap={false}>
            <span className={styles["input-label"]}>Buy:</span>
            <div className={styles.input}>
              <InputNumber
                className={styles.number}
                value={toNum}
                step="0.0001"
                stringMode
                controls={false}
                bordered={false}
                disabled
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
          </Row>
        </Col>
        {isDesktopOrLaptop ? (
          <Col span={2}>
            <BasicButton
              className={["button", styles["switch-button"]].join(" ")}
              style={{ width: "69px", verticalAlign: "top", lineHeight: "60px" }}
              onClick={onSwitchButtonClick}
            >
              <IconSwitch />
            </BasicButton>
          </Col>
        ) : null}
        <Col span={isDesktopOrLaptop ? 6 : 24}>
          {available ? (
            <TransactionButton
              className="button"
              onClick={debouncedOnSwapButtonClick}
              noConnectText="Connect wallet to exchange"
              style={{ width: "100%" }}
              loading={![0, 1].includes(exchangeStatus)}
              loadingText={exchangeStatus === 2 ? "Waiting Tx..." : "Please wait..."}
              requiredChainId={chain?.chainId}
              switchNetworkText="Switch Network to Exchange"
            >
              {pair ? "Swap" : "Add Liquidity"}
            </TransactionButton>
          ) : null}
        </Col>
      </Row>
    </div>
  );
}
