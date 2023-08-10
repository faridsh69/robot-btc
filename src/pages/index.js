import { useEffect, useState } from "react";
import styles from "../styles/main.module.css";

import {
  calcProfitOnTick,
  checkLiquid,
  checkStopLoss,
  closeCondition,
  closePosition,
  openCondition,
  openPosition,
  readFile,
  renderResultOfPositions,
} from "../assets/helper";
import { TIME_FRAMES } from "@/assets/constants";

export default function Home() {
  // useEffect(() => {
  //   start();
  // }, []);

  const initialData = {
    stopLoss: 0.01,
    trailingStopLoss: true,
    timeframe: TIME_FRAMES.fifteenMin,
    zarib: 10,
    amount: 500,
    money: 5000,
    sell: false,
    fee: 0.0006, // 0.400%
  };

  const [timeframe, setTimefram] = useState(initialData.timeframe);
  const [zaribInput, setZarib] = useState(initialData.zarib);
  const [amountInput, setAmount] = useState(initialData.amount);
  const [initialMoneyInput, setInitialMoney] = useState(initialData.money);
  const [sellInput, setSell] = useState(initialData.sell);
  const [candlesChart, setCandlesChart] = useState([]);
  const [equityChart, setEquityChart] = useState([]);
  const [result, setResult] = useState({});

  // read selected file or use saved data
  const start = () => {
    readFile(startBackTest, timeframe);
  };

  const startBackTest = (candles, altCoinCandles) => {
    console.log("1 candles", candles);
    console.log("2 altCoinCandles", altCoinCandles);
    return;
    // Init Data
    const initialPosition = {
      stopLoss: -1 * initialData.stopLoss * zaribInput * amountInput,
      isOpen: false,
      profit: null,
      openPrice: null,
      closePrice: null,
      zarib: zaribInput,
      amount: amountInput,
      volume: zaribInput * amountInput,
      trailingStopLoss: initialData.trailingStopLoss,
      fee: initialData.fee,
      feePrice: zaribInput * amountInput * initialData.fee,
      sell: sellInput,
      sellZarib: sellInput ? -1 : 1,
    };
    let equityArray = [];
    let equity = initialMoneyInput;
    let equityOutOfPosition = initialMoneyInput;

    // Calculate Positions
    let position = { ...initialPosition };
    const positions = [];

    for (const candleIndex in candles) {
      const candle = candles[candleIndex];
      if (openCondition(position, candles, +candleIndex)) {
        position = openPosition(position, candle);
      } else if (closeCondition(position, candles, +candleIndex)) {
        position = closePosition(position, candle);
        equityOutOfPosition = equityOutOfPosition + position.profit;
        equity = equityOutOfPosition;
        positions.push(position);
        position = { ...initialPosition };
      } else if (position.isOpen) {
        position = checkStopLoss(position, candle);
        if (!position.isOpen) {
          equityOutOfPosition = equityOutOfPosition + position.profit;
          equity = equityOutOfPosition;
          positions.push(position);
          position = { ...initialPosition };
        } else {
          if (checkLiquid(equityOutOfPosition, position, candle)) {
            alert("LIQUID");
            break;
          }
          equity = equityOutOfPosition + calcProfitOnTick(position, candle);
        }
      }
      equityArray.push({ date: candle.date, equity });
    }
    setCandlesChart(candles);
    setEquityChart(equityArray);
    setResult(
      renderResultOfPositions(
        positions,
        candles,
        initialMoneyInput,
        equityOutOfPosition
      )
    );
    console.log("1 candles", candles);
    console.log("2 equityArray", equityArray);
    console.log("3 positions", positions);
  };

  return (
    <div>
      <div className={styles.control}>
        <p>initialMoney</p>
        <input
          type="number"
          className={styles.input}
          value={initialMoneyInput}
          onChange={(e) => setInitialMoney(+e.target.value)}
        />
        <p>amount</p>
        <input
          type="number"
          className={styles.input}
          value={amountInput}
          onChange={(e) => setAmount(+e.target.value)}
        />

        <p>zarib</p>
        <input
          type="number"
          className={styles.input}
          value={zaribInput}
          onChange={(e) => setZarib(+e.target.value)}
        />

        <select value={timeframe} onChange={(e) => setTimefram(e.target.value)}>
          {Object.values(TIME_FRAMES).map((tf) => (
            <option value={tf} key={tf}>
              {tf}
            </option>
          ))}
        </select>

        <label htmlFor="sell">sell?</label>
        <input
          id="sell"
          type="checkbox"
          checked={sellInput}
          onChange={(e) => setSell(e.target.checked)}
        />
        <input type="file" name="file" id="file" accept=".csv" />
        <input type="button" id="btnsubmit" value="Start" onClick={start} />
      </div>
      {JSON.stringify(result)}
      <br />
      <br />
      CandlesChart (0 - 100,000)
      <div className={styles.chart}>
        {candlesChart.map((candle, candleIndex) => {
          if (candleIndex % (candlesChart.length / 1000) > 1) return null;
          return (
            <div
              key={candle.date}
              className={styles.chart_col}
              style={{ height: candle.open / 500 + "px" }}
            >
              <div className={styles.date}>
                {candleIndex === 0 && candle.date.substring(0, 7)}
              </div>
            </div>
          );
        })}
      </div>
      EQuity (0 - 8X)
      <div className={styles.chart}>
        {equityChart.map((equity, equityIndex) => {
          if (equityIndex % (equityChart.length / 1000) > 1) return null;

          return (
            <div
              key={equity.date}
              className={styles.chart_col}
              style={{
                height: equity.equity / (0.04 * initialMoneyInput) + "px",
              }}
            >
              <div className={styles.date}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
