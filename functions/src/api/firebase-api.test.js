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
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const firebase_api_1 = require("./firebase-api");
jest.mock('firebase-admin', () => {
    const mockCollection = jest.fn();
    return {
        firestore: jest.fn().mockImplementation(() => ({
            collection: mockCollection,
        })),
        credential: {
            cert: jest.fn(),
        },
        initializeApp: jest.fn(),
        mockCollection,
    };
});
xdescribe('api test', () => {
    test('get projects', () => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-ignore
        admin.mockCollection.mockImplementationOnce(() => ({
            where: (fieldPath, opStr, value) => {
                expect(fieldPath).toBe('userId');
                expect(opStr).toBe('==');
                expect(value).toBe('fake-user-id');
                return {
                    get: () => Promise.resolve({
                        docs: [
                            { data: () => ({ projectUid: 'abc' }) },
                            { data: () => ({ projectUid: 'def' }) },
                        ],
                    }),
                };
            },
        })).mockImplementationOnce(() => ({
            where: (fieldPath, opStr, value) => {
                expect(fieldPath).toBe('uid');
                expect(opStr).toBe('in');
                expect(value).toStrictEqual(['abc', 'def']);
                return {
                    get: () => Promise.resolve({
                        docs: [
                            { data: () => ({ uid: 'abc', name: 'test 1', collections: [] }) },
                            { data: () => ({ uid: 'def', name: 'test 2', collections: [] }) },
                        ],
                    }),
                };
            },
        }));
        const result = yield (0, firebase_api_1.getProjects)('fake-user-id');
        expect(result).toStrictEqual([{
                uid: 'abc',
                name: 'test 1',
                collections: [],
            }, {
                uid: 'def',
                name: 'test 2',
                collections: [],
            }]);
    }));
});
