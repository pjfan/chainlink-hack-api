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
exports.getReputationScore = exports.getAccountAgeMonths = exports.getAvgTxnsPastSixMonths = void 0;
const node_1 = __importDefault(require("moralis/node"));
const moment_1 = __importDefault(require("moment"));
require("dotenv/config");
// Load moralis SDK
const MORALIS_SERVER_URL = process.env.MORALIS_SERVER_URL || "";
const MORALIS_APP_ID = process.env.MORALIS_APP_ID || "";
node_1.default.start({ serverUrl: MORALIS_SERVER_URL, appId: MORALIS_APP_ID });
// function to get avg txns per month for past six months of history
const getAvgTxnsPastSixMonths = (chain, address) => __awaiter(void 0, void 0, void 0, function* () {
    const toDate = (0, moment_1.default)().format();
    const fromDate = (0, moment_1.default)().subtract(6, 'months').format();
    const pastSixMonthsTxns = yield node_1.default.Web3API.account
        .getTransactions({ chain: chain, address: address, from_date: fromDate, to_date: toDate })
        .catch((err) => {
        console.log(err);
        return null;
    });
    // pastSixMonthsTxns?.['total'] is total number of transactions over past 6 months
    if ((pastSixMonthsTxns === null || pastSixMonthsTxns === void 0 ? void 0 : pastSixMonthsTxns['total']) === undefined) {
        return null;
    }
    else {
        return (pastSixMonthsTxns === null || pastSixMonthsTxns === void 0 ? void 0 : pastSixMonthsTxns['total']) / 6;
    }
});
exports.getAvgTxnsPastSixMonths = getAvgTxnsPastSixMonths;
// function to get age of account in months
const getAccountAgeMonths = (chain, address) => __awaiter(void 0, void 0, void 0, function* () {
    // get all transactions for address + chain
    let allTxns = yield node_1.default.Web3API.account
        .getTransactions({ chain: chain, address: address })
        .catch((err) => {
        console.log(err);
        return null;
    });
    if ((allTxns === null || allTxns === void 0 ? void 0 : allTxns['total']) !== 0) {
        return 0;
    }
    // return null if allTxns undefined
    if ((allTxns === null || allTxns === void 0 ? void 0 : allTxns['total']) && (allTxns === null || allTxns === void 0 ? void 0 : allTxns['page_size'])) {
        // get last "page" of transactions if transaction history spans multiple pages
        if ((allTxns === null || allTxns === void 0 ? void 0 : allTxns['total']) > (allTxns === null || allTxns === void 0 ? void 0 : allTxns['page_size'])) {
            const offset = (allTxns === null || allTxns === void 0 ? void 0 : allTxns['total']) - ((allTxns === null || allTxns === void 0 ? void 0 : allTxns['total']) % (allTxns === null || allTxns === void 0 ? void 0 : allTxns['page_size']));
            console.log("Total transactions (" + (allTxns === null || allTxns === void 0 ? void 0 : allTxns['total']) + ") greater than page size (" + (allTxns === null || allTxns === void 0 ? void 0 : allTxns['page_size']) + "). Getting last page using offset of: " + offset);
            allTxns = yield node_1.default.Web3API.account
                .getTransactions({ chain: chain, address: address, offset: offset })
                .catch((err) => {
                console.log(err);
                return null;
            });
            console.log("Getting last page (page " + (allTxns === null || allTxns === void 0 ? void 0 : allTxns['page']) + ") of transactions.");
        }
    }
    else {
        return null;
    }
    // calculate age of address using months since first transaction
    // return 0 if any required parameters are 0
    if (allTxns !== undefined && (allTxns === null || allTxns === void 0 ? void 0 : allTxns.result) !== undefined) {
        const firstTxn = allTxns.result[allTxns.result.length - 1];
        if (firstTxn === undefined) {
            return null;
        }
        console.log("Timestamp of first transaction: " + (0, moment_1.default)(firstTxn['block_timestamp']).toString());
        const monthsSinceFirstTxn = (0, moment_1.default)().diff((0, moment_1.default)(firstTxn['block_timestamp']), 'months'); // off by 1
        return monthsSinceFirstTxn;
    }
    else {
        return null;
    }
});
exports.getAccountAgeMonths = getAccountAgeMonths;
const getReputationScore = (chain, address) => __awaiter(void 0, void 0, void 0, function* () {
    const monthsSinceFirstTxn = yield (0, exports.getAccountAgeMonths)(chain, address);
    const avgTxnsSixMonths = yield (0, exports.getAvgTxnsPastSixMonths)(chain, address);
    if (monthsSinceFirstTxn && avgTxnsSixMonths) {
        // determine age score for this account (50% of score)
        const ageScore = 5 - (1.05 ** (-monthsSinceFirstTxn)) * 5;
        console.log("monthsSinceFirstTxn: " + monthsSinceFirstTxn);
        console.log("ageScore is: " + ageScore);
        // determine avg number of transactions in last 6 months (50% of score)
        const avgTxnsSixMonthsScore = 5 - (1.07 ** (-avgTxnsSixMonths)) * 5;
        console.log("avgTxnsSixMonths: " + avgTxnsSixMonths);
        console.log("avgTxnsSixMonthsScore is: " + avgTxnsSixMonthsScore);
        // calculate reputation score
        const reputationScore = ageScore + avgTxnsSixMonthsScore;
        console.log("Reputation Score is: " + reputationScore);
        return reputationScore;
    }
    else {
        return null;
    }
});
exports.getReputationScore = getReputationScore;
