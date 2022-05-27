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
exports.apiRouter = void 0;
const express_1 = __importDefault(require("express"));
const erc20Integration_1 = require("../functions/erc20Integration");
const activityIntegration_1 = require("../functions/activityIntegration");
const reputationScoreIntegration_1 = require("../functions/reputationScoreIntegration");
const nftpoapIntegration_1 = require("../functions/nftpoapIntegration");
// setup express Router
const router = express_1.default.Router();
/* GET api root */
router.get('/', function (req, res) {
    return res.json({
        "apiEndPoints": "/api/reputation/:chain/:address, /api/erc20/:chain/:address, /api/DID/:chain/:address, /api/follow_metrics/:chain/:address, /api/address_history/:chain/:address, /api/profile/:chain/:address"
    });
});
router.get('/reputation/:chain/:address', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const address = req.params.address;
        const chain = req.params.chain;
        const reputationScore = yield (0, reputationScoreIntegration_1.getReputationScore)(chain, address);
        const reputation = {
            "reputation": reputationScore,
        };
        return res.json(reputation);
    });
});
router.get('/erc20/:chain/:address', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const address = req.params.address;
        const chain = req.params.chain;
        const tokenBalances = yield (0, erc20Integration_1.getTokenBalances)(address, chain);
        const totalValueUsd = tokenBalances === null || tokenBalances === void 0 ? void 0 : tokenBalances.reduce((sum, current) => {
            if (current.value) {
                return sum + current.value;
            }
            else {
                return sum;
            }
        }, 0);
        const erc20 = {
            "tokenBalances": tokenBalances,
            "totalValueUsd": totalValueUsd,
        };
        return res.json(erc20);
    });
});
router.get('/address_history/:chain/:address', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const address = req.params.address;
        const chain = req.params.chain;
        const activityInfo = yield (0, activityIntegration_1.getActivityInfo)(chain, address);
        const addressHistory = {
            "txnPerMonth": activityInfo === null || activityInfo === void 0 ? void 0 : activityInfo.transactionsPerMonth,
            "activeBuyerSeller": activityInfo === null || activityInfo === void 0 ? void 0 : activityInfo.activeBuyerSeller,
            "monthsSinceFirstTxn": activityInfo === null || activityInfo === void 0 ? void 0 : activityInfo.monthsSinceFirstTransaction,
            "existedLongEnough": activityInfo === null || activityInfo === void 0 ? void 0 : activityInfo.existedLongEnough,
            "userIsActive": activityInfo === null || activityInfo === void 0 ? void 0 : activityInfo.userIsActive,
        };
        return res.json(addressHistory);
    });
});
router.get('/nft/:chain/:address', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const address = req.params.address;
        const chain = req.params.chain;
        const nfts = yield (0, nftpoapIntegration_1.getNFTs)(address, chain, false);
        return res.json(nfts);
    });
});
router.get('/poap/:chain/:address', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const address = req.params.address;
        const chain = req.params.chain;
        const poaps = yield (0, nftpoapIntegration_1.getNFTs)(address, chain, true);
        return res.json(poaps);
    });
});
router.get('/profile/:chain/:address', function (req, res) {
    const profile = {
        "name": "",
        "description": "",
        "profilePhoto": ""
    };
    return res.json(profile);
});
router.get('/DID/:chain/:address', function (req, res) {
    const did = {
        "did": "",
    };
    return res.json(did);
});
router.get('/follow_metrics/:chain/:address', function (req, res) {
    const followMetrics = {
        "followCount": "",
        "totalValueFollowers": "",
        "followingCount": ""
    };
    return res.json(followMetrics);
});
exports.apiRouter = router;
