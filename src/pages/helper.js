import moment from "moment/moment";
import jsonBtc from "./btc2020.json";

export const openCondition = (candle, position) => {
  if (position.isOpen) return false;

  var dayIndex = moment(candle.date).format("dddd");

  return dayIndex === "Friday";
};

export const closeCondition = (candle, position) => {
  if (!position.isOpen) return false;

  var dayIndex = moment(candle.date).format("dddd");

  return dayIndex === "Thursday";
};

export const openPosition = (position, candle) => {
  return {
    ...position,
    isOpen: true,
    openPrice: candle.open,
  };
};

export const closePosition = (position, candle) => {
  if (!position.isOpen) return position;

  const newPosition = {
    ...position,
    closePrice: candle.open,
  };
  newPosition.profit = calculateProfit(newPosition);

  return newPosition;
};

export const calcMoneyOnTick = (money, position, candle, initialPosition) => {
  // If there is no position opened, so dont run
  if (!position.isOpen) return [money, position];

  // checkStopLoss();

  // Reduce previous raise
  money = money - position.profit;

  const newPosition = {
    ...position,
    closePrice: candle.open,
  };

  newPosition.profit = calculateProfit(newPosition, false);
  money = money + newPosition.profit;

  return [money, newPosition];
};

const calculateProfit = (position, calculateFee = true) => {
  const percentageProfit =
    (position.closePrice - position.openPrice) / position.openPrice;
  return (
    Math.round(percentageProfit * position.volume * position.sellZarib) -
    (calculateFee ? position.feePrice : 0)
  );
};

const checkStopLoss = (position, candle) => {
  if (position.stopLoss) {
    if (!position.sell) {
      if (
        (candle.low - position.openPrice) / position.openPrice <
        position.stopLoss
      ) {
        position.profit = position.stopLoss * position.zarib * position.amount;

        position = { ...initialPosition, profit: position.profit };
        console.log("STOP candle", candle);
        console.log("STOP position", position);
        return [money + position.profit - position.feePrice, { ...position }];
      }
    }
  }
};

export const checkLiquid = (money, position, candle) => {
  const low =
    money +
    (((position.sell ? candle.high : candle.low) - position.openPrice) /
      position.openPrice) *
      position.volume *
      position.sellZarib;

  if (low <= 0 || money <= 0) {
    return true;
  }

  return false;
};

export const readFile = () => {
  const files = document.querySelector("#file").files;
  const file = files[0];
  if (!file) return jsonBtc;

  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function (event) {
    const csvdata = event.target.result;
    const rowData = csvdata.split("\n");
    const btcData = rowData.reverse();
    const chartArray = [];

    for (let rowIndex = 1; rowIndex < btcData.length; rowIndex++) {
      const tickRawData = btcData[rowIndex].split(",");
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
      chartArray.push(candle);
    }
    console.log(JSON.stringify(chartArray));

    return chartArray;
  };

  return jsonBtc;
};
