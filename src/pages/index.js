import { Inter } from "next/font/google";
import { useState } from "react";

import {
  calcMoneyOnClose,
  calcMoneyOnTick,
  closeCondition,
  openCondition,
  openPosition,
} from "./helper";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [zarib, setZarib] = useState(20);
  const [amount, setAmount] = useState(250);
  const [initialMoney, setInitialMoney] = useState(2000);
  const [sell, setSell] = useState(true);
  const [chart, setChart] = useState([]);
  const [balance, setBalance] = useState([]);

  function readCSVFile() {
    // Init Data
    const initialPosition = {
      profit: 0,
      openPrice: 0,
      closePrice: 0,
      isOpen: false,
      zarib: zarib,
      amount: amount,
      fee: 0.004,
    };
    let money = initialMoney;
    let position = initialPosition;
    const chartArray = [];
    const balanceArray = [];
    // Render Excel
    const files = document.querySelector("#file").files;
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function (event) {
      const csvdata = event.target.result;
      const rowData = csvdata.split("\n");
      for (let rowIndex = 1; rowIndex < rowData.length; rowIndex++) {
        const rowColData = rowData[rowIndex].split(",");
        if (!rowColData[0]) continue;
        const item = {
          date: rowColData[0],
          open: +rowColData[1],
          hight: +rowColData[2],
          low: +rowColData[3],
          close: +rowColData[4].replace("\r", ""),
        };
        chartArray.push(item);

        // Positions
        position.closePrice = item.open;
        if (openCondition(item)) {
          position = openPosition(position, item);
        }
        if (closeCondition(item)) {
          money = calcMoneyOnClose(money, position);
          position = initialPosition;
        }
        money = calcMoneyOnTick(money, position);
        balanceArray.push(money);
      }

      setChart(chartArray);
      setBalance(balanceArray);
    };
  }

  return (
    <div>
      <div className="control">
        <p>initialMoney</p>
        <input
          type="number"
          value={initialMoney}
          onChange={(e) => setInitialMoney(e.target.value)}
        />
        <p>amount</p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <p>zarib</p>
        <input
          type="number"
          value={zarib}
          onChange={(e) => setZarib(e.target.value)}
        />
        <label htmlFor="sell">sell?</label>
        <input
          id="sell"
          type="checkbox"
          checked={sell}
          onChange={(e) => setSell(e.target.checked)}
        />
        <input type="file" name="file" id="file" accept=".csv" />
        <input
          type="button"
          id="btnsubmit"
          value="Submit"
          onClick={readCSVFile}
        />
      </div>
      2023
      <div className="chart">
        {chart.map((chartData) => (
          <div
            key={chartData.date}
            className="chart-col"
            style={{ height: chartData.open / 200 + "px" }}
          ></div>
        ))}
      </div>
      sood
      <div className="chart">
        {balance.map((balanceData) => (
          <div
            key={balanceData}
            className="chart-col"
            style={{ height: balanceData / 120 + "px" }}
          ></div>
        ))}
      </div>
    </div>
  );
}
