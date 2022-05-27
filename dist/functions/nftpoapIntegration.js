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
exports.getNFTs = void 0;
const node_1 = __importDefault(require("moralis/node"));
require("dotenv/config");
// Load moralis SDK
const MORALIS_SERVER_URL = process.env.MORALIS_SERVER_URL || "";
const MORALIS_APP_ID = process.env.MORALIS_APP_ID || "";
node_1.default.start({ serverUrl: MORALIS_SERVER_URL, appId: MORALIS_APP_ID });
const getNFTs = (address, chain, onlyPoaps) => __awaiter(void 0, void 0, void 0, function* () {
    // fetch nfts from address
    const res = yield node_1.default.Web3API.account
        .getNFTs({ address: address, chain: chain })
        .catch((err) => {
        console.log(err);
        return null;
    });
    console.log('Fetched all user NFTs for chain: ' + chain);
    if (!(res === null || res === void 0 ? void 0 : res.result)) {
        return null;
    }
    const allNftMetadata = res.result.map((nft) => (Object.assign(Object.assign({}, nft), { metadata: nft.metadata ? JSON.parse(nft.metadata) : null })));
    // filter based on onlyPoaps boolean
    const nftMetadata = allNftMetadata.filter((nft) => {
        var _a, _b, _c, _d;
        if (onlyPoaps) {
            return (_b = (_a = nft.metadata) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b.includes("poap");
        }
        else {
            return !((_d = (_c = nft.metadata) === null || _c === void 0 ? void 0 : _c.tags) === null || _d === void 0 ? void 0 : _d.includes("poap"));
        }
    });
    const nfts = nftMetadata.map((nft) => {
        var _a, _b, _c, _d;
        let imgUrl = ((_a = nft.metadata) === null || _a === void 0 ? void 0 : _a.image_url) || ((_b = nft.metadata) === null || _b === void 0 ? void 0 : _b.image) || null;
        // convert ipfs urls to use gateway
        if (imgUrl === null || imgUrl === void 0 ? void 0 : imgUrl.startsWith("ipfs://ipfs/")) {
            imgUrl = imgUrl.replace("ipfs://", "https://ipfs.io/");
        }
        else if (imgUrl === null || imgUrl === void 0 ? void 0 : imgUrl.startsWith("ipfs://")) {
            imgUrl = imgUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
        }
        return {
            "name": ((_c = nft.metadata) === null || _c === void 0 ? void 0 : _c.name) || nft.name || null,
            "imageUrl": imgUrl,
            "openSeaUrl": `https://opensea.io/assets/${nft.token_address}/${nft.token_id}`,
            "tokenAddress": nft.token_address,
            "description": ((_d = nft.metadata) === null || _d === void 0 ? void 0 : _d.description) || null
        };
    });
    return nfts;
});
exports.getNFTs = getNFTs;
