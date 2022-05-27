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
exports.getTotalValue = exports.getTokenBalances = exports.getTokenPrice = void 0;
const node_1 = __importDefault(require("moralis/node"));
require("dotenv/config");
// Load moralis SDK
const MORALIS_SERVER_URL = process.env.MORALIS_SERVER_URL || "";
const MORALIS_APP_ID = process.env.MORALIS_APP_ID || "";
node_1.default.start({ serverUrl: MORALIS_SERVER_URL, appId: MORALIS_APP_ID });
const getTokenPrice = (inputToken, chain) => __awaiter(void 0, void 0, void 0, function* () {
    // slow down API call rate.
    yield new Promise((resolve) => setTimeout(resolve, 1200));
    console.log('Fetching price data for: ' + inputToken.name);
    const price = yield node_1.default.Web3API.token
        .getTokenPrice({ address: inputToken.token_address, chain: chain })
        .then((token) => token.usdPrice)
        .catch((err) => {
        console.log(err);
        return null;
    });
    return price;
});
exports.getTokenPrice = getTokenPrice;
const getTokenBalances = (address, chain) => __awaiter(void 0, void 0, void 0, function* () {
    // fetch token balance from address
    const tokens = yield node_1.default.Web3API.account
        .getTokenBalances({ address: address, chain: chain })
        .catch((err) => {
        console.log(err);
        return null;
    });
    console.log('Fetched all ERC20 balances for chain: ' + chain);
    if (tokens === null || tokens.length === 0)
        return null;
    // create Map() to store token balances, populate with info from API call.
    const tokenBalances = new Map();
    for (const token of tokens) {
        const tokenInfo = {
            logo: token.logo,
            name: token.name,
            symbol: token.symbol,
            balance: parseFloat(token.balance) * Math.pow(10, -1 * token.decimals),
            price: undefined,
            value: undefined,
            token_address: token.token_address,
        };
        tokenBalances.set(token.token_address, tokenInfo);
    }
    // attempt to get price data for each token
    for (const token of tokens) {
        const price = yield (0, exports.getTokenPrice)(token, chain);
        try {
            const tokenInfo = tokenBalances.get(token.token_address);
            if (tokenInfo && price) {
                tokenInfo.price = price;
                tokenInfo.value = tokenInfo.price * tokenInfo.balance;
                tokenBalances.set(token.token_address, tokenInfo);
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    return Array.from(tokenBalances.values());
});
exports.getTokenBalances = getTokenBalances;
const getTotalValue = (address, chain) => __awaiter(void 0, void 0, void 0, function* () {
    // fetch token balance from address
    const tokens = yield node_1.default.Web3API.account
        .getTokenBalances({ address: address, chain: chain })
        .catch((err) => {
        console.log(err);
        return null;
    });
    console.log('Fetched all ERC20 balances for chain: ' + chain);
    if (tokens === null || tokens.length === 0)
        return null;
    // attempt to get price data for each token
    let totalValueUsd = 0;
    for (const token of tokens) {
        const price = yield (0, exports.getTokenPrice)(token, chain);
        try {
            if (price) {
                totalValueUsd += (price * parseFloat(token.balance) * Math.pow(10, -1 * token.decimals));
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    return totalValueUsd;
});
exports.getTotalValue = getTotalValue;
