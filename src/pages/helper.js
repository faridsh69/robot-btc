import moment from "moment/moment";

export const openCondition = (item) => {
  var dayIndex = moment(item.date).day();

  return dayIndex === 5;
};

export const closeCondition = (item) => {
  var dayIndex = moment(item.date).day();

  return dayIndex === 1;
};

export const openPosition = (position, item) => {
  position.openPrice = item.open;
  position.isOpen = true;

  return position;
};

export const calcMoneyOnTick = (money, position) => {
  if (money < 0) return 0;

  if (!position.isOpen) return money;

  position.profit =
    ((position.closePrice - position.openPrice) / position.openPrice) *
    position.zarib *
    position.amount;
  money = money + position.profit * (position.sell ? 1 : -1);

  return money;
};

export const calcMoneyOnClose = (money, position) => {
  if (!position.isOpen) return money;

  position.profit =
    ((position.closePrice - position.openPrice) / position.openPrice) *
    position.zarib *
    position.amount;
  money = money + position.profit * (position.sell ? 1 : -1);

  return money;
};
