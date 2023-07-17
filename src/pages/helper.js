import moment from "moment/moment";
import jsonBtc from "./btc2020.json";

export const openCondition = (item) => {
  var dayIndex = moment(item.date).day();

  return dayIndex === 0;
};

export const closeCondition = (candle) => {
  var dayIndex = moment(candle.date).day();

  return dayIndex === 6;
};

export const openPosition = (position, candle) => {
  position.openPrice = candle.open;
  position.isOpen = true;

  return position;
};

export const calcFee = (position) => {
  return position.zarib * position.amount * position.fee;
};

export const calcMoneyOnTick = (money, position, candle, initialPosition) => {
  position.closePrice = candle.open;
  if (!position.isOpen) return [money, position];

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

  const low =
    money +
    (((position.sell ? candle.high : candle.low) - position.openPrice) /
      position.openPrice) *
      position.zarib *
      position.amount *
      position.sellZarib;
  if (low <= 0) {
    console.log("1 LIQ candle", candle);
    console.log("1 LIQ position", position);
    return [0, position];
  }

  position.profit =
    ((position.closePrice - position.openPrice) / position.openPrice) *
    position.zarib *
    position.amount *
    position.sellZarib;

  money = money + position.profit;

  if (money <= 0) {
    console.log("2 LIQ candle", candle);
    console.log("2 LIQ position", position);
    return [0, position];
  }

  return [money, position];
};

export const calcMoneyOnClose = (money, position, candle) => {
  if (!position.isOpen) return money;
  position.closePrice = candle.open;

  position.profit =
    ((position.closePrice - position.openPrice) / position.openPrice) *
    position.zarib *
    position.amount *
    position.sellZarib;

  money = money + position.profit - position.feePrice;

  return money;
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
      console.log("1 chartArray", JSON.stringify(chartArray));
    }

    return chartArray;
  };
};
