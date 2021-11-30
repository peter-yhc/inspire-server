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
const router_1 = __importDefault(require("@koa/router"));
const firebase_api_1 = require("../../api/firebase-api");
const imageRouter = new router_1.default();
imageRouter.post('/images', (context) => __awaiter(void 0, void 0, void 0, function* () {
    const request = context.request.body;
    if (!(yield (0, firebase_api_1.canEdit)(context.token, request.projectUid))) {
        context.status = 401;
        return;
    }
    context.body = yield (0, firebase_api_1.uploadImage)(request.projectUid, request.locationUid, request.src);
    context.status = 201;
}));
imageRouter.get('/images/:projectUid/:locationUid', (context) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield (0, firebase_api_1.canRead)(context.token, context.params.projectUid))) {
        context.status = 401;
        return;
    }
    context.body = yield (0, firebase_api_1.fetchImages)(context.params.projectUid, context.params.locationUid);
}));
imageRouter.post('/images/:projectUid/:locationUid/delete', (context) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield (0, firebase_api_1.canEdit)(context.token, context.params.projectUid))) {
        context.status = 401;
        return;
    }
    const request = context.request.body;
    yield (0, firebase_api_1.removeImages)(context.params.projectUid, context.params.locationUid, request.uids);
    context.status = 201;
}));
exports.default = imageRouter;
