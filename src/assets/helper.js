import moment from "moment/moment";
import { TIME_FRAMES } from "./constants";
import savedCandlesWeekly from "../sources/BTCUSD8-1w.json";
import savedCandlesDaily from "../sources/BTCUSD8-1d.json";
import savedCandlesfourHours from "../sources/BTCUSD8-4h.json";
import savedCandlesoneHour from "../sources/BTCUSD8-1h.json";
import savedCandlesthirtyMin from "../sources/BTCUSD8-30m.json";
import savedCandlesfifteenMin from "../sources/BTCUSD8-15m.json";
import savedCandlesfiveMin from "../sources/BTCUSD8-5m.json";
import savedCandlesoneMin from "../sources/BTCUSD8-1m.json";

export const readFile = (startBackTest, timeframe) => {
  const files = document.querySelector("#file").files;
  const file = files[0];
  if (!file) {
    startBackTest(getSavedCandles(timeframe));
    return;
  }
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (event) => {
    const candles = convertExcelToArray(event);
    startBackTest(candles);
  };
};

const getSavedCandles = (timeframe) => {
  if (timeframe === TIME_FRAMES.weekly) return savedCandlesWeekly;
  if (timeframe === TIME_FRAMES.daily) return savedCandlesDaily;
  if (timeframe === TIME_FRAMES.fourHours) return savedCandlesfourHours;
  if (timeframe === TIME_FRAMES.oneHour) return savedCandlesoneHour;
  if (timeframe === TIME_FRAMES.thirtyMin) return savedCandlesthirtyMin;
  if (timeframe === TIME_FRAMES.fifteenMin) return savedCandlesfifteenMin;
  if (timeframe === TIME_FRAMES.fiveMin) return savedCandlesfiveMin;
  if (timeframe === TIME_FRAMES.oneMin) return savedCandlesoneMin;
};

const convertExcelToArray = (event) => {
  const csvData = event.target.result;
  const rowData = csvData.split("\n");
  // const reversedRowData = rowData.reverse();
  // console.log("1 reversedRowData", reversedRowData);
  const candles = [];

  for (let rowIndex = 1; rowIndex < rowData.length; rowIndex++) {
    const tickRawData = rowData[rowIndex].split(",");
    const candle = {
      date: tickRawData[0] + " " + tickRawData[1],
      open: +tickRawData[2],
      hight: +tickRawData[3],
      low: +tickRawData[4],
      close: +tickRawData[5],
    };

    candles.push(candle);
  }
  console.log("1 candles", JSON.stringify(candles));
  return candles;
};

export const openPosition = (position, candle) => {
  return {
    ...position,
    isOpen: true,
    openPrice: candle.open,
  };
};

export const closePosition = (position, candle) => {
  const newPosition = {
    ...position,
    closePrice: candle.open,
  };
  newPosition.profit = calculateProfit(newPosition);
  return newPosition;
};

export const calcProfitOnTick = (position, candle) => {
  const newPosition = {
    ...position,
    closePrice: candle.open,
  };

  return calculateProfit(newPosition, false);
};

const calculateProfit = (position, calculateFee = true) => {
  const fee = calculateFee ? position.feePrice : 0;
  const percentageProfit =
    (position.closePrice - position.openPrice) / position.openPrice;
  const profit = percentageProfit * position.volume;

  return Math.floor(profit * position.sellZarib - fee);
};

// const checkStopLoss = (position, candle) => {
//   if (position.stopLoss) {
//     if (!position.sell) {
//       if (
//         (candle.low - position.openPrice) / position.openPrice <
//         position.stopLoss
//       ) {
//         position.profit = position.stopLoss * position.zarib * position.amount;

//         position = { ...initialPosition, profit: position.profit };
//         console.log("STOP candle", candle);
//         console.log("STOP position", position);
//         return [money + position.profit - position.feePrice, { ...position }];
//       }
//     }
//   }
// };

// export const checkLiquid = (money, position, candle) => {
//   const low =
//     money +
//     (((position.sell ? candle.high : candle.low) - position.openPrice) /
//       position.openPrice) *
//       position.volume *
//       position.sellZarib;

//   if (low <= 0 || money <= 0) {
//     return true;
//   }

//   return false;
// };

export const closeCondition = (candle, position) => {
  if (!position.isOpen) return false;

  var dayIndex = moment(candle.date).format("dddd");

  return dayIndex === "Thursday";
};

export const openCondition = (candle, position) => {
  if (position.isOpen) return false;

  var dayIndex = moment(candle.date).format("dddd");

  return dayIndex === "Friday";
};
