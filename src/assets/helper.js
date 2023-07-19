import moment from "moment/moment";
// import savedCandles from "./btc2020.json";

export const readFile = (startBackTest) => {
  const files = document.querySelector("#file").files;
  const file = files[0];
  // if (!file) {
  //   startBackTest(savedCandles);
  //   return;
  // }
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (event) => {
    const candles = convertExcelToArray(event);
    startBackTest(candles);
  };
};

const convertExcelToArray = (event) => {
  const csvData = event.target.result;
  const rowData = csvData.split("\n");
  const reversedRowData = rowData.reverse();
  console.log("1 reversedRowData", reversedRowData);
  const candles = [];

  for (let rowIndex = 1; rowIndex < reversedRowData.length; rowIndex++) {
    const tickRawData = reversedRowData[rowIndex].split(",");
    const candle = {
      date: tickRawData[0],
      open: +tickRawData[1],
      hight: +tickRawData[2],
      low: +tickRawData[3],
      close: +tickRawData[4].replace("\r", ""),
    };

    if (!candle.date || moment(candle.date).diff(moment("01/05/2020")) < 0) {
      continue;
    }
    candles.push(candle);
  }
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
