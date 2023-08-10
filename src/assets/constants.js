import savedCandlesWeeklyBtc from "../sources/1-1-BTCUSD-1w.json";
import savedCandlesDailyBtc from "../sources/1-2-BTCUSD-1d.json";
import savedCandlesfourHoursBtc from "../sources/1-3-BTCUSD-4h.json";
import savedCandlesoneHourBtc from "../sources/1-4-BTCUSD-1h.json";
import savedCandlesthirtyMinBtc from "../sources/1-5-BTCUSD-30m.json";
import savedCandlesfifteenMinBtc from "../sources/1-6-BTCUSD-15m.json";
import savedCandlesfiveMinBtc from "../sources/1-7-BTCUSD-5m.json";
import savedCandlesoneMinBtc from "../sources/1-8-BTCUSD-1m.json";

import savedCandlesWeeklyLtc from "../sources/2-1-LTCUSD-1w.json";
import savedCandlesDailyLtc from "../sources/2-2-LTCUSD-1d.json";
import savedCandlesfourHoursLtc from "../sources/2-3-LTCUSD-4h.json";
import savedCandlesoneHourLtc from "../sources/2-4-LTCUSD-1h.json";
import savedCandlesthirtyMinLtc from "../sources/2-5-LTCUSD-30m.json";
import savedCandlesfifteenMinLtc from "../sources/2-6-LTCUSD-15m.json";
import savedCandlesfiveMinLtc from "../sources/2-7-LTCUSD-5m.json";
import savedCandlesoneMinLtc from "../sources/2-8-LTCUSD-1m.json";

export const COINS = {
  btc: "btc",
  ltc: "ltc",
};

export const TIME_FRAMES = {
  weekly: "weekly",
  daily: "daily",
  fourHours: "fourHours",
  oneHour: "oneHour",
  thirtyMin: "thirtyMin",
  fifteenMin: "fifteenMin",
  fiveMin: "fiveMin",
  oneMin: "oneMin",
};

export const SAVED_CANDLES = {
  btc: {
    [TIME_FRAMES.weekly]: savedCandlesWeeklyBtc,
    [TIME_FRAMES.daily]: savedCandlesDailyBtc,
    [TIME_FRAMES.fourHours]: savedCandlesfourHoursBtc,
    [TIME_FRAMES.oneHour]: savedCandlesoneHourBtc,
    [TIME_FRAMES.thirtyMin]: savedCandlesthirtyMinBtc,
    [TIME_FRAMES.fifteenMin]: savedCandlesfifteenMinBtc,
    [TIME_FRAMES.fiveMin]: savedCandlesfiveMinBtc,
    [TIME_FRAMES.oneMin]: savedCandlesoneMinBtc,
  },
  ltc: {
    [TIME_FRAMES.weekly]: savedCandlesWeeklyLtc,
    [TIME_FRAMES.daily]: savedCandlesDailyLtc,
    [TIME_FRAMES.fourHours]: savedCandlesfourHoursLtc,
    [TIME_FRAMES.oneHour]: savedCandlesoneHourLtc,
    [TIME_FRAMES.thirtyMin]: savedCandlesthirtyMinLtc,
    [TIME_FRAMES.fifteenMin]: savedCandlesfifteenMinLtc,
    [TIME_FRAMES.fiveMin]: savedCandlesfiveMinLtc,
    [TIME_FRAMES.oneMin]: savedCandlesoneMinLtc,
  },
};
