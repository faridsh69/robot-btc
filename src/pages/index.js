import { useState } from "react";
import styles from "../styles/main.module.css";

import {
  calcProfitOnTick,
  closeCondition,
  closePosition,
  openCondition,
  openPosition,
  readFile,
} from "../assets/helper";
import { TIME_FRAMES } from "@/assets/constants";

export default function Home() {
  const [timeframe, setTimefram] = useState(TIME_FRAMES.oneHour);
  const [zaribInput, setZarib] = useState(10);
  const [amountInput, setAmount] = useState(500);
  const [initialMoneyInput, setInitialMoney] = useState(5000);
  const [sellInput, setSell] = useState(false);
  const [candlesChart, setCandlesChart] = useState([]);
  const [equityChart, setEquityChart] = useState([]);
  const stopLossInput = 0.4;
  const feeInput = 0.0006; // 0.0200% + 0.0400%

  // read selected file or use saved data
  const start = () => {
    readFile(startBackTest, timeframe);
  };

  const startBackTest = (candles) => {
    // Init Data
    const initialPosition = {
      isOpen: false,
      profit: null,
      openPrice: null,
      closePrice: null,
      zarib: zaribInput,
      amount: amountInput,
      volume: zaribInput * amountInput,
      stopLoss: stopLossInput * -1,
      fee: feeInput,
      feePrice: zaribInput * amountInput * feeInput,
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
      if (openCondition(candle, position)) {
        position = openPosition(position, candle);
        continue;
      }

      if (closeCondition(candle, position)) {
        position = closePosition(position, candle);
        equityOutOfPosition = equityOutOfPosition + position.profit;
        equity = equityOutOfPosition;
        positions.push(position);
        position = { ...initialPosition };
        continue;
      }

      if (position.isOpen) {
        equity = equityOutOfPosition + calcProfitOnTick(position, candle);
      }
      // if (checkLiquid(money, position, candle)) {
      //   alert("LIQUID");
      //   break;
      // }
      equityArray.push({
        date: candle.date,
        equity: equityOutOfPosition,
        position,
      });
    }
    setCandlesChart(candles.slice(0, 10000));
    setEquityChart(equityArray.slice(0, 10000));
    console.log("1 candles", candles);
    console.log("2 equityArray", equityArray);
    console.log("3 positions", positions);
    // console.log("4 equity", equity / initialMoneyInput);
    console.log(
      "4 equityOutOfPosition",
      equityOutOfPosition / initialMoneyInput
    );
  };

  return (
    <div>
      <div className={styles.control}>
        <p>initialMoney</p>
        <input
          type="number"
          value={initialMoneyInput}
          onChange={(e) => setInitialMoney(+e.target.value)}
        />
        <p>amount</p>
        <input
          type="number"
          value={amountInput}
          onChange={(e) => setAmount(+e.target.value)}
        />
        <p>zarib</p>
        <input
          type="number"
          value={zaribInput}
          onChange={(e) => setZarib(+e.target.value)}
        />
        <label htmlFor="sell">sell?</label>
        <input
          id="sell"
          type="checkbox"
          checked={sellInput}
          onChange={(e) => setSell(e.target.checked)}
        />
        <input type="file" name="file" id="file" accept=".csv" />
        <input type="button" id="btnsubmit" value="Start" onClick={start} />
        <br />
        <select value={timeframe} onChange={(e) => setTimefram(e.target.value)}>
          {Object.values(TIME_FRAMES).map((tf) => (
            <option value={tf} key={tf}>
              {tf}
            </option>
          ))}
        </select>
      </div>
      CandlesChart
      <div className={styles.chart}>
        {candlesChart.map((candle, candleIndex) => (
          <div
            key={candle.date}
            className={styles.chart_col}
            style={{ height: candle.open / 500 + "px" }}
          >
            <div className={styles.date}>
              {candleIndex % 80 === 0 && candle.date.substring(0, 7)}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.chart}>
        {equityChart.map((equity, equityIndex) => (
          <div
            key={equity.date}
            className={styles.chart_col}
            style={{ height: equity.equity / 200 + "px" }}
          >
            <div className={styles.date}>
              {equityIndex % 80 === 0 && equity.date.substring(0, 7)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
