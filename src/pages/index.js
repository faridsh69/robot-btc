import { useState } from "react";

import {
  calcFee,
  calcMoneyOnClose,
  calcMoneyOnTick,
  closeCondition,
  openCondition,
  openPosition,
  readFile,
} from "./helper";

export default function Home() {
  const [zarib, setZarib] = useState(10);
  const [amount, setAmount] = useState(500);
  const [initialMoney, setInitialMoney] = useState(1000);
  const [sell, setSell] = useState(false);
  const [chart, setChart] = useState([]);
  const [balance, setBalance] = useState([]);
  const stopLoss = 0.4;

  const render = () => {
    // Init Data
    const balanceArray = [];
    const initialPosition = {
      profit: 0,
      openPrice: 0,
      closePrice: 0,
      isOpen: false,
      zarib: zarib,
      amount: amount,
      stopLoss: stopLoss * -1,
      fee: 0.004,
      feePrice: zarib * amount * 0.004,
      sell: sell,
      sellZarib: sell ? -1 : 1,
    };
    initialPosition.feePrice = calcFee(initialPosition);

    let money = initialMoney;
    let position = { ...initialPosition };
    const btcData = readFile();

    // Positions
    for (const candleIndex in btcData) {
      const candle = btcData[candleIndex];
      if (openCondition(candle)) {
        position = openPosition(position, candle);
      }
      if (closeCondition(candle)) {
        money = calcMoneyOnClose(money, position, candle);
        position = { ...initialPosition, profit: position.profit };
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
    setChart(btcData);
    setBalance(balanceArray);
    console.log("3 money", money / initialMoney);
  };

  return (
    <div>
      <div className="control">
        <p>initialMoney</p>
        <input
          type="number"
          value={initialMoney}
          onChange={(e) => setInitialMoney(+e.target.value)}
        />
        <p>amount</p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(+e.target.value)}
        />
        <p>zarib</p>
        <input
          type="number"
          value={zarib}
          onChange={(e) => setZarib(+e.target.value)}
        />
        <label htmlFor="sell">sell?</label>
        <input
          id="sell"
          type="checkbox"
          checked={sell}
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
