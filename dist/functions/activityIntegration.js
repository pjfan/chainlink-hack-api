"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityInfo = exports.getHistory = exports.getPastSixMo = void 0;
const node_1 = __importDefault(require("moralis/node"));
const moment_1 = __importDefault(require("moment"));
require("dotenv/config");
// Load moralis SDK
const MORALIS_SERVER_URL = process.env.MORALIS_SERVER_URL || "";
const MORALIS_APP_ID = process.env.MORALIS_APP_ID || "";
node_1.default.start({ serverUrl: MORALIS_SERVER_URL, appId: MORALIS_APP_ID });
const getPastSixMo = (chain, address, from_date, to_date) => __awaiter(void 0, void 0, void 0, function* () {
    return yield node_1.default.Web3API.account
        .getTransactions({ chain: chain, address: address, from_date: from_date, to_date: to_date })
        .catch((err) => {
        console.log(err);
        return null;
    });
});
exports.getPastSixMo = getPastSixMo;
const getHistory = (chain, address) => __awaiter(void 0, void 0, void 0, function* () {
    let history = yield node_1.default.Web3API.account
        .getTransactions({ chain: chain, address: address })
        .catch((err) => {
        console.log(err);
        return null;
    });
    if ((history === null || history === void 0 ? void 0 : history['total']) && (history === null || history === void 0 ? void 0 : history['page_size']) && (history === null || history === void 0 ? void 0 : history['total']) !== 0) {
        if ((history === null || history === void 0 ? void 0 : history['total']) > (history === null || history === void 0 ? void 0 : history['page_size'])) {
            const offset = (history === null || history === void 0 ? void 0 : history['total']) - ((history === null || history === void 0 ? void 0 : history['total']) % (history === null || history === void 0 ? void 0 : history['page_size']));
            console.log("Total transactions (" + (history === null || history === void 0 ? void 0 : history['total']) + ") greater than page size (" + (history === null || history === void 0 ? void 0 : history['page_size']) + "). Getting last page using offset of: " + offset);
            history = yield node_1.default.Web3API.account
                .getTransactions({ chain: chain, address: address, offset: offset })
                .catch((err) => {
                console.log(err);
                return null;
            });
            console.log("Getting last page (page " + (history === null || history === void 0 ? void 0 : history['page']) + ") of transactions.");
        }
    }
    return history;
});
exports.getHistory = getHistory;
const getActivityInfo = (chain, address) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Get past 6 months of transactions for address on chain  
    const today = (0, moment_1.default)().format();
    const sixMonthsAgo = (0, moment_1.default)().subtract(6, 'months').format();
    const pastSixMo = yield (0, exports.getPastSixMo)(chain, address, sixMonthsAgo, today);
    if (pastSixMo === undefined || ((_a = pastSixMo === null || pastSixMo === void 0 ? void 0 : pastSixMo.result) === null || _a === void 0 ? void 0 : _a.length) === 0)
        return;
    let numTransactionsPastSixMo = pastSixMo === null || pastSixMo === void 0 ? void 0 : pastSixMo['total'];
    if (numTransactionsPastSixMo === undefined) {
        numTransactionsPastSixMo = 1;
    }
    const transactionsPerMonth = numTransactionsPastSixMo / 6;
    const activeBuyerSeller = transactionsPerMonth > 2;
    //
    const history = yield (0, exports.getHistory)(chain, address);
    if (history !== undefined && (history === null || history === void 0 ? void 0 : history.result) !== undefined) {
        const firstTransaction = history.result[history.result.length - 1];
        if (firstTransaction === undefined)
            return;
        const firstTransactionTimestamp = (0, moment_1.default)(firstTransaction['block_timestamp']);
        const monthsSinceFirstTransaction = (0, moment_1.default)().diff(firstTransactionTimestamp, 'months'); // off by 1
        const existedLongEnough = monthsSinceFirstTransaction >= 6;
        const userIsActive = existedLongEnough && activeBuyerSeller;
        const activityInfoResult = {
            transactionsPerMonth: transactionsPerMonth,
            activeBuyerSeller: activeBuyerSeller,
            monthsSinceFirstTransaction: monthsSinceFirstTransaction,
            existedLongEnough: existedLongEnough,
            userIsActive: userIsActive,
        };
        console.log(activityInfoResult);
        return activityInfoResult;
    }
});
exports.getActivityInfo = getActivityInfo;
