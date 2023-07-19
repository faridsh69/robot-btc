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

export default function Home() {
  const [timeframe, setTimefram] = useState("1 day");
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
    readFile(startBackTest);
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
    setCandlesChart(candles);
    setEquityChart(equityArray);
    console.log("1 candles", candles);
    console.log("2 equityArray", equityArray);
    // console.log("3 positions", positions);
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
          <option value="1 day">1 day</option>
          <option value="4 hour">4 hour</option>
          <option value="1 hour">1 hour</option>
          <option value="30 min">30 min</option>
          <option value="15 min">15 min</option>
          <option value="5 min">5 min</option>
          <option value="1 min">1 min</option>
        </select>
      </div>
      CandlesChart
      <div className={styles.chart}>
        {candlesChart.map((candle, index) => (
          <div
            key={candle.date}
            className={styles.chart_col}
            style={{ height: candle.open / 500 + "px" }}
          >
            <div className={styles.date}>
              {index % 100 === 0 && candle.date}
            </div>
          </div>
        ))}
      </div>
      EquityChart
      <div className={styles.chart}>
        {equityChart.map((equity) => (
          <div
            key={equity.date}
            className={styles.chart_col}
            style={{ height: equity.equity / 200 + "px" }}
          ></div>
        ))}
      </div>
    </div>
  );
}
