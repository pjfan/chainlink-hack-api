"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { rootHandler, helloHandler } from './handlers';
const api_1 = require("./routes/api");
const app = (0, express_1.default)();
const port = process.env.PORT || '3000';
app.use(express_1.default.urlencoded({ extended: false }));
app.use('/api', api_1.apiRouter);
app.get('/', function (req, res) {
    return res.json({
        "desc": "Web3 ReputationOracle API. (API portion of project for Chainlink Hackathon Spring 2022)"
    });
});
app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});
