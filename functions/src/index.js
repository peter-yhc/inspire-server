"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const koa_1 = __importDefault(require("koa"));
const cors_1 = __importDefault(require("@koa/cors"));
const functions = __importStar(require("firebase-functions"));
const auth_1 = require("./auth");
const project_1 = require("./project");
const images_1 = require("./images");
const firebase_api_1 = require("./api/firebase-api");
const app = new koa_1.default();
app.use((0, cors_1.default)());
app.use((context, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    context.request.body = context.req.body;
    yield next();
}));
app.use((context, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = context.request.headers.authorization;
    if (authHeader) {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = yield firebase_api_1.auth.verifyIdToken(token);
        context.token = decodedToken.user_id;
        yield next();
    }
}));
app.use(auth_1.AuthRouter.routes());
app.use(project_1.ProjectRouter.routes());
app.use(images_1.ImageRouter.routes());
exports.app = functions.region('australia-southeast1').https.onRequest(app.callback());
