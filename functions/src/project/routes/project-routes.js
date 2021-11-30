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
const projectRouter = new router_1.default({ prefix: '/projects' });
projectRouter.get('/', (context) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('get projects');
    const projects = yield (0, firebase_api_1.getProjects)(context.token);
    context.body = JSON.stringify(projects);
}));
projectRouter.post('/', (context) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('create projects');
    const request = context.request.body;
    console.log('create projects request', request);
    context.body = yield (0, firebase_api_1.createProject)(context.token, request.name, 'Owner');
    context.status = 201;
}));
projectRouter.post('/:projectUid/users', (context) => __awaiter(void 0, void 0, void 0, function* () {
    const request = context.request.body;
    if (!(yield (0, firebase_api_1.isOwner)(context.token, context.params.projectUid))) {
        context.status = 401;
        return;
    }
    yield (0, firebase_api_1.addProjectUser)(request.userEmail, context.params.projectUid, request.role);
    context.status = 201;
}));
projectRouter.delete('/:projectUid/users', (context) => __awaiter(void 0, void 0, void 0, function* () {
    const request = context.request.body;
    if (!(yield (0, firebase_api_1.isOwner)(context.token, context.params.projectUid))) {
        context.status = 401;
        return;
    }
    yield (0, firebase_api_1.removeProjectUser)(request.userEmail, context.params.projectUid);
    context.status = 200;
}));
projectRouter.post('/:projectUid/collections', (context) => __awaiter(void 0, void 0, void 0, function* () {
    const request = context.request.body;
    if (!(yield (0, firebase_api_1.canEdit)(context.token, context.params.projectUid))) {
        context.status = 401;
        return;
    }
    context.body = yield (0, firebase_api_1.createCollection)(context.params.projectUid, request.name);
    context.status = 201;
}));
projectRouter.delete('/:projectUid/collections/:collectionUid', (context) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield (0, firebase_api_1.canEdit)(context.token, context.params.projectUid))) {
        context.status = 401;
        return;
    }
    context.body = yield (0, firebase_api_1.removeCollection)(context.params.projectUid, context.params.collectionUid);
    context.status = 200;
}));
projectRouter.post('/:projectUid/collections/:collectionUid/focuses', (context) => __awaiter(void 0, void 0, void 0, function* () {
    const request = context.request.body;
    if (!(yield (0, firebase_api_1.canEdit)(context.token, context.params.projectUid))) {
        context.status = 401;
        return;
    }
    context.body = yield (0, firebase_api_1.createFocus)(context.params.projectUid, context.params.collectionUid, request.name);
    context.status = 201;
}));
projectRouter.delete('/:projectUid/collections/:collectionUid/focuses/:focusUid', (context) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield (0, firebase_api_1.canEdit)(context.token, context.params.projectUid))) {
        context.status = 401;
        return;
    }
    context.body = yield (0, firebase_api_1.removeFocus)(context.params.projectUid, context.params.collectionUid, context.params.focusUid);
    context.status = 200;
}));
exports.default = projectRouter;
