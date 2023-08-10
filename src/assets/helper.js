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
      high: +tickRawData[3],
      low: +tickRawData[4],
      close: +tickRawData[5],
    };

    candles.push(candle);
  }

  console.log("1 candles", JSON.stringify(candles));
  return candles;
};

export const renderResultOfPositions = (positions, candles) => {
  let success = 0,
    fault = 0,
    profit = 0,
    damage = 0;
  for (const position of positions) {
    if (position.profit > 0) {
      profit += position.profit;
      success++;
    }
    if (position.profit < 0) {
      damage += position.profit;
      fault++;
    }
  }

  let momentumCandles = 0,
    totalCandles = 0;
  for (const candle of candles) {
    totalCandles++;
    if (isMomentumCandle(candle)) {
      momentumCandles++;
    }
  }

  return {
    success,
    fault,
    profit,
    damage,
    all: positions.length,
    total: profit + damage,
    momentumCandles,
    totalCandles,
  };
};

export const openPosition = (position, candle) => {
  return {
    ...position,
    isOpen: true,
    openPrice: candle.close,
  };
};

export const closePosition = (position, candle) => {
  const newPosition = {
    ...position,
    closePrice: candle.close,
  };
  const profit = calculateProfit(newPosition);
  newPosition.profit =
    profit > position.stopLoss ? profit : position.stopLoss - position.feePrice;

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

export const checkStopLoss = (position, candle) => {
  if (position.stopLoss === null) return position;

  const worstDamage = calcProfitOnTick(position, { open: candle.low });
  // Check to close position on stop loss
  if (worstDamage < position.stopLoss) {
    return {
      ...position,
      isOpen: false,
      profit: position.stopLoss - position.feePrice,
      closePrice: candle.low,
    };
  }

  // trailing stop loss
  const partialProfit = calcProfitOnTick(position, candle);
  const n = Math.floor(partialProfit / Math.abs(position.stopLoss));
  if (n > 2) {
    return {
      ...position,
      stopLoss: (n - 1) * Math.abs(position.stopLoss),
    };
  }

  return position;
};

export const checkLiquid = (equityOutOfPosition, position, candle) => {
  const worstCase = !position.sell
    ? { open: candle.low }
    : { open: candle.high };

  return equityOutOfPosition + calcProfitOnTick(position, worstCase) < 0;
};

export const closeCondition = (position, candles, candleIndex) => {
  if (!position.isOpen) return false;

  // const lastCandles = candles.slice(candleIndex - 4, candleIndex + 1);
  // const filterLastRallyCandles = lastCandles.filter((c) => isDropCandle(c));

  // return filterLastRallyCandles.length > 4;
  return false;
};

export const openCondition = (position, candles, candleIndex) => {
  if (position.isOpen) return false;

  const lastCandles = candles.slice(candleIndex - 4, candleIndex + 1);
  const filterLastRallyCandles = lastCandles.filter((c) => isRallyCandle(c));

  return filterLastRallyCandles.length > 4;
};

export const isMomentumCandle = (candle) => {
  return Math.abs(candle.close - candle.open) > (candle.high - candle.low) / 2;
};

export const isRallyCandle = (candle) => {
  return candle.close - candle.open > 0;
};

export const isDropCandle = (candle) => {
  return candle.close - candle.open < 0;
};
