import { useState } from "react";

import {
  calcMoneyOnClose,
  calcMoneyOnTick,
  checkLiquid,
  closeCondition,
  closePosition,
  openCondition,
  openPosition,
  readFile,
} from "./helper";

export default function Home() {
  const [zaribInput, setZarib] = useState(10);
  const [amountInput, setAmount] = useState(500);
  const [initialMoneyInput, setInitialMoney] = useState(5000);
  const [sellInput, setSell] = useState(false);
  const [chart, setChart] = useState([]);
  const [balance, setBalance] = useState([]);
  const stopLossInput = 0.4;
  const feeInput = 0.000004;

  const render = () => {
    // Init Data
    const balanceArray = [];
    const positions = [];
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

    let money = initialMoneyInput;
    let position = { ...initialPosition };
    const btcData = readFile();

    // Positions
    for (const candleIndex in btcData) {
      const candle = btcData[candleIndex];
      if (openCondition(candle, position)) {
        position = openPosition(position, candle);
      } else if (closeCondition(candle, position)) {
        positions.push(position);
        money = money + closePosition(position, candle).profit;
        position = { ...initialPosition };
      }

      if (checkLiquid(money, position, candle)) {
        break;
      }

      [money, position] = calcMoneyOnTick(
        money,
        position,
        candle,
        initialPosition
      );

      balanceArray.push({
        date: candle.date,
        money,
        position: { ...position },
      });
    }
    console.log("1 btcData", btcData);
    console.log("2 balanceArray", balanceArray);
    console.log("3 positions", positions);

    setChart(btcData);
    setBalance(balanceArray);
    console.log("4 money", money / initialMoneyInput);
  };

  return (
    <div>
      <div className="control">
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
        <input type="button" id="btnsubmit" value="Submit" onClick={render} />
      </div>
      <div className="chart">
        {chart.map((chartData, index) => (
          <div
            key={chartData.date}
            className="chart-col"
            style={{ height: chartData.open / 500 + "px" }}
          >
            <div className="date">{index % 100 === 0 && chartData.date}</div>
          </div>
        ))}
      </div>
      <div className="chart">
        {balance.map((balanceData) => (
          <div
            key={balanceData.date}
            className="chart-col"
            style={{ height: balanceData.money / 200 + "px" }}
            x={balanceData.money}
          ></div>
        ))}
      </div>
    </div>
  );
}
