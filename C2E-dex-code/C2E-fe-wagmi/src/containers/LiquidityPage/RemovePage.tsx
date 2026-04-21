import { useEffect, useState } from "react";
import { Row, Col, Radio, Slider } from "antd";

import { useWallet } from "@src/hooks/useWallet";
import { usePair } from "@src/hooks/usePair";
import { useSwap } from "@src/hooks/useSwap";
import { useMessage } from "@src/hooks/useMessage";
import { formatUnits } from "@src/util";
import TransactionButton from "@src/components/elements/TransactionButton";

import styles from "./SwapPage.module.scss";

const P = {
  a: 25,
  b: 50,
  c: 75,
  d: 100,
};

export default function RemovePage({ pair }) {
  const [percent, setPercent] = useState(0);
  const [removeAmount, setRemoveAmount] = useState(0n);
  const [radio, setRadio] = useState("");
  const { chain, walletAddress } = useWallet();
  const { setSuccessMessage, setErrorMessage } = useMessage();
  const { routerContract } = useSwap();
  const {
    userToken1Reserve,
    userToken2Reserve,
    token1Symbol,
    token2Symbol,
    LPbalance,
    token1Addr,
    token2Addr,
    approveToRouter,
    name,
  } = usePair(pair);

  async function removeLiquidity() {
    try {
      const tx0 = await approveToRouter(pair, removeAmount);
      await tx0.wait();
      const tx = await routerContract.removeLiquidity(
        token1Addr,
        token2Addr,
        removeAmount,
        0n,
        0n,
        walletAddress,
        BigInt(Math.floor(Date.now() / 1000) + 60 * 10),
      );
      await tx.wait();
      setSuccessMessage("Remove liquidity success");
    } catch (error) {
      console.error(error);
      setErrorMessage("Remove liquidity failed");
    }
  }

  useEffect(() => {
    if (!LPbalance) return;
    const liquidity = BigInt(LPbalance);
    setRemoveAmount(percent === 100 ? liquidity : (liquidity * BigInt(percent)) / 100n);
  }, [percent, LPbalance]);

  useEffect(() => {
    switch (percent) {
      case 25:
        setRadio("a");
        break;
      case 50:
        setRadio("b");
        break;
      case 75:
        setRadio("c");
        break;
      case 100:
        setRadio("d");
        break;
      default:
        setRadio("");
    }
  }, [percent]);

  return (
    <div>
      <h2 className={styles.title}>
        <Row>
          <Col>
            <span>Remove Liquidity</span>
          </Col>
        </Row>
      </h2>
      <Row justify="center">
        <Col>
          <span>{percent}%</span>
        </Col>
      </Row>
      <Slider min={0} max={100} onChange={(value) => setPercent(value)} value={percent} />

      <Row justify="center" style={{ marginBottom: "20px" }}>
        <Radio.Group buttonStyle="solid" onChange={(e) => setPercent(P[e.target.value])} value={radio}>
          <Radio.Button value="a">25%</Radio.Button>
          <Radio.Button value="b">50%</Radio.Button>
          <Radio.Button value="c">75%</Radio.Button>
          <Radio.Button value="d">MAX</Radio.Button>
        </Radio.Group>
      </Row>
      <div style={{ marginBottom: "10px" }}>
        <div className="balance">LP Balance: {formatUnits(LPbalance, 8)?.toFixed(8)}</div>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <div className="balance">Stored {token1Symbol}: {formatUnits(userToken1Reserve, 8)?.toFixed(8)}</div>
        <div className="balance">Stored {token2Symbol}: {formatUnits(userToken2Reserve, 8)?.toFixed(8)}</div>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <div className="balance">Remove LP: {formatUnits(removeAmount, 8)?.toFixed(8)} {name}</div>
      </div>
      <TransactionButton
        className="button"
        onClick={removeLiquidity}
        noConnectText="Connect wallet to exchange"
        style={{ width: "100%" }}
        requiredChainId={chain?.chainId}
        switchNetworkText="Switch Network to Exchange"
      >
        Remove Liquidity
      </TransactionButton>
    </div>
  );
}
