"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("@koa/router"));
const authRouter = new router_1.default();
authRouter.get('/login', (ctx) => {
    ctx.body = 'login endpoint';
});
exports.default = authRouter;
