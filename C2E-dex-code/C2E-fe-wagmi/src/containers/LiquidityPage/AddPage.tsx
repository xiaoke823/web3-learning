import { useEffect, useRef, useState } from "react";
import { InputNumber, Row, Col } from "antd";

import { parseUnits } from "@src/lib/viem";
import { useSwap } from "@src/hooks/useSwap";
import { usePair } from "@src/hooks/usePair";
import { useWallet } from "@src/hooks/useWallet";
import { useMessage } from "@src/hooks/useMessage";
import { formatUnits } from "@src/util";
import TransactionButton from "@src/components/elements/TransactionButton";

import styles from "./SwapPage.module.scss";

export function AddPage({ pair }) {
  const { walletAddress, chain } = useWallet();
  const { setSuccessMessage, setErrorMessage } = useMessage();
  const { routerContract } = useSwap();
  const {
    token1Addr,
    token2Addr,
    token1Symbol,
    token2Symbol,
    token1Balance,
    token2Balance,
    LPbalance,
    name,
    quote,
    userToken1Reserve,
    userToken2Reserve,
    approveToRouter,
  } = usePair(pair);

  const [fromNum, setFromNum] = useState<number>();
  const [toNum, setToNum] = useState<number>();
  const waiting = useRef(false);
  const quoteTimer = useRef<any>();

  useEffect(() => {
    if (token1Addr && token2Addr && fromNum) {
      clearTimeout(quoteTimer.current);
      quoteTimer.current = setTimeout(updateQuoteAmount, 300);
    }
  }, [token2Addr, token1Addr, fromNum]);

  function updateQuoteAmount() {
    if (!fromNum || Number(fromNum.toFixed(8)) === 0) return;
    quote(pair, fromNum).then((amountB) => setToNum(Number(Number(amountB).toFixed(8))));
  }

  async function onAddLiquidity() {
    if (!fromNum || fromNum === 0) {
      setErrorMessage("Please input exchange token number");
      return;
    }

    const amountADesired = parseUnits(fromNum.toString());
    const amountBDesired = parseUnits(toNum.toString());
    const amountAMin = (amountADesired * 99n) / 100n;
    const amountBMin = (amountBDesired * 99n) / 100n;

    const tx1 = await approveToRouter(token1Addr, amountADesired);
    const tx2 = await approveToRouter(token2Addr, amountBDesired);
    await Promise.all([tx1.wait(), tx2.wait()]);

    routerContract
      .addLiquidity(
        token1Addr,
        token2Addr,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        walletAddress,
        BigInt(Math.floor(Date.now() / 1000) + 60 * 10),
      )
      .then((tx) => tx.wait())
      .then(() => setSuccessMessage("Exchange success"))
      .catch((error) => {
        console.error(error);
        setErrorMessage("Exchange failed");
      })
      .finally(() => {
        setFromNum(0);
        setToNum(0);
      });
  }

  function debouncedOnClick() {
    if (waiting.current) return;
    waiting.current = true;
    onAddLiquidity().finally(() => {
      setTimeout(() => {
        waiting.current = false;
      }, 2000);
    });
  }

  return (
    <div>
      <h2 className={styles.title}>
        <Row>
          <Col>
            <span>Add Liquidity</span>
          </Col>
        </Row>
      </h2>
      <div style={{ marginBottom: "20px" }}>
        <div className={styles.balance}>LP Balance: {formatUnits(LPbalance, 8)?.toFixed(8)} {name}</div>
        <div className={styles.balance}>Balance: {formatUnits(token1Balance, 8)?.toFixed(8)} {token1Symbol}</div>
        <div className={styles.balance}>Balance: {formatUnits(token2Balance, 8)?.toFixed(8)} {token2Symbol}</div>
        <div className={styles.balance}>Stored: {formatUnits(userToken1Reserve, 8)?.toFixed(8)} {token1Symbol}</div>
        <div className={styles.balance}>Stored: {formatUnits(userToken2Reserve, 8)?.toFixed(8)} {token2Symbol}</div>
      </div>
      <Row gutter={[16, 16]}>
        <div className={styles.input}>
          <InputNumber
            className={styles.number}
            value={fromNum}
            max={formatUnits(token1Balance, 4)}
            min={0}
            step="0.0001"
            onChange={(value) => setFromNum(Number(value))}
            stringMode
            controls={false}
            bordered={false}
          />
          <div className={styles.unit}>{token1Symbol}</div>
        </div>
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
          <div className={styles.unit}>{token2Symbol}</div>
        </div>
        <TransactionButton
          className="button"
          onClick={debouncedOnClick}
          noConnectText="Connect wallet to add liquidity"
          style={{ width: "100%" }}
          requiredChainId={chain?.chainId}
          switchNetworkText="Switch Network to Add Liquidity"
        >
          Add Liquidity
        </TransactionButton>
      </Row>
    </div>
  );
}
