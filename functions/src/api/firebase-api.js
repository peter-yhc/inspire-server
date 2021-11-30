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
exports.auth = exports.removeImages = exports.fetchImages = exports.uploadImage = exports.removeFocus = exports.createFocus = exports.removeCollection = exports.createCollection = exports.removeProjectUser = exports.addProjectUser = exports.getProjects = exports.createProject = exports.canRead = exports.canEdit = exports.isOwner = void 0;
const admin = __importStar(require("firebase-admin"));
const nanoid_1 = require("nanoid");
const data_interfaces_1 = require("./data-interfaces");
// eslint-disable-next-line import/no-absolute-path
// const serviceAccount = require('D:\\inspire-dev.json');
//
// const options = process.env.NODE_ENV !== 'production'
//   ? { credential: admin.credential.cert(serviceAccount) }
//   : undefined;
const app = admin.initializeApp();
const db = admin.firestore(app);
const auth = admin.auth(app);
exports.auth = auth;
function isOwner(userId, projectUid) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectRoleMappings = yield db.collection(data_interfaces_1.DatabaseCollections.ProjectRoleMappings)
            .where('userId', '==', userId)
            .where('projectUid', '==', projectUid)
            .where('role', '==', 'Owner')
            .get();
        return !!projectRoleMappings.docs.pop();
    });
}
exports.isOwner = isOwner;
function canEdit(userId, projectUid) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectRoleMappings = yield db.collection(data_interfaces_1.DatabaseCollections.ProjectRoleMappings)
            .where('userId', '==', userId)
            .where('projectUid', '==', projectUid)
            .where('role', 'in', ['Owner', 'Editor'])
            .get();
        return !!projectRoleMappings.docs.pop();
    });
}
exports.canEdit = canEdit;
function canRead(userId, projectUid) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectRoleMappings = yield db.collection(data_interfaces_1.DatabaseCollections.ProjectRoleMappings)
            .where('userId', '==', userId)
            .where('projectUid', '==', projectUid)
            .get();
        return !!projectRoleMappings.docs.pop();
    });
}
exports.canRead = canRead;
function getProjectDocument(projectUid) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectSnapshot = yield db.collection(data_interfaces_1.DatabaseCollections.Projects)
            .where('uid', '==', projectUid)
            .get();
        return projectSnapshot.docs.pop();
    });
}
function getProjects(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectRoleMappings = yield db.collection(data_interfaces_1.DatabaseCollections.ProjectRoleMappings)
            .where('userId', '==', userId)
            .get();
        const projectUids = projectRoleMappings.docs
            .map((projectRoleMapping) => projectRoleMapping.data().projectUid);
        const projectSnapshot = yield db.collection(data_interfaces_1.DatabaseCollections.Projects)
            .where('uid', 'in', projectUids)
            .get();
        return projectSnapshot.docs.map((project) => project.data());
    });
}
exports.getProjects = getProjects;
function createProject(userId, name, role) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectUid = (0, nanoid_1.nanoid)();
        yield db.collection(data_interfaces_1.DatabaseCollections.Projects).add({ name, uid: projectUid, collections: [] });
        yield db.collection(data_interfaces_1.DatabaseCollections.ProjectRoleMappings)
            .add({ userId, projectUid, role });
        return {
            name,
            uid: projectUid,
            collections: [],
        };
    });
}
exports.createProject = createProject;
function addProjectUser(userEmail, projectUid, role) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield auth.getUserByEmail(userEmail);
        const userProjectMappingSnapshot = yield db.collection(data_interfaces_1.DatabaseCollections.ProjectRoleMappings)
            .where('userId', '==', user.uid)
            .where('projectUid', '==', projectUid)
            .get();
        const userMappingId = (_a = userProjectMappingSnapshot.docs.pop()) === null || _a === void 0 ? void 0 : _a.id;
        if (userMappingId) {
            yield db.collection(data_interfaces_1.DatabaseCollections.ProjectRoleMappings).doc(userMappingId).set({
                userId: user.uid,
                projectUid,
                role,
            });
        }
        else {
            yield db.collection(data_interfaces_1.DatabaseCollections.ProjectRoleMappings).add({
                userId: user.uid,
                projectUid,
                role,
            });
        }
    });
}
exports.addProjectUser = addProjectUser;
function removeProjectUser(userEmail, projectUid) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield auth.getUserByEmail(userEmail);
        const userMappingSnapshot = yield db.collection(data_interfaces_1.DatabaseCollections.ProjectRoleMappings)
            .where('userId', '==', user.uid)
            .where('projectUid', '==', projectUid)
            .get();
        const userMappingId = (_a = userMappingSnapshot.docs.pop()) === null || _a === void 0 ? void 0 : _a.id;
        if (userMappingId) {
            yield db.collection(data_interfaces_1.DatabaseCollections.ProjectRoleMappings).doc(userMappingId).delete();
        }
    });
}
exports.removeProjectUser = removeProjectUser;
function createCollection(projectUid, collectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectSnapshot = yield db.collection(data_interfaces_1.DatabaseCollections.Projects)
            .where('uid', '==', projectUid)
            .get();
        const projectDoc = projectSnapshot.docs.pop();
        if (!projectDoc) {
            throw new Error('Project does not exist.');
        }
        const project = projectDoc.data();
        const newCollection = { name: collectionName, uid: (0, nanoid_1.nanoid)(), focuses: [] };
        project.collections = [...project.collections, newCollection];
        yield db.collection(data_interfaces_1.DatabaseCollections.Projects).doc(projectDoc.id).set(project);
        return newCollection;
    });
}
exports.createCollection = createCollection;
function removeCollection(projectUid, collectionUid) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectDoc = yield getProjectDocument(projectUid);
        if (!projectDoc) {
            throw new Error('Project does not exist.');
        }
        const project = projectDoc.data();
        project.collections = project.collections.filter((collection) => collection.uid !== collectionUid);
        yield db.collection(data_interfaces_1.DatabaseCollections.Projects).doc(projectDoc.id).set(project);
        return project;
    });
}
exports.removeCollection = removeCollection;
function createFocus(projectUid, collectionUid, focusName) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectDoc = yield getProjectDocument(projectUid);
        if (!projectDoc) {
            throw new Error('Project does not exist.');
        }
        const project = projectDoc.data();
        const collection = project.collections.find((collection) => collection.uid === collectionUid);
        if (!collection) {
            throw new Error('Collection does not exist.');
        }
        const newFocus = { name: focusName, uid: (0, nanoid_1.nanoid)() };
        collection.focuses.push(newFocus);
        yield db.collection(data_interfaces_1.DatabaseCollections.Projects).doc(projectDoc.id).set(project);
        return newFocus;
    });
}
exports.createFocus = createFocus;
function removeFocus(projectUid, collectionUid, focusUid) {
    return __awaiter(this, void 0, void 0, function* () {
        const projectSnapshot = yield db.collection(data_interfaces_1.DatabaseCollections.Projects)
            .where('uid', '==', projectUid)
            .get();
        const projectDoc = projectSnapshot.docs.pop();
        if (!projectDoc) {
            throw new Error('Project does not exist.');
        }
        const project = projectDoc.data();
        const collection = project.collections.find((collection) => collection.uid === collectionUid);
        if (!collection) {
            throw new Error('Collection does not exist.');
        }
        collection.focuses.filter((focus) => focus.uid !== focusUid);
        yield db.collection(data_interfaces_1.DatabaseCollections.Projects).doc(projectDoc.id).set(project);
        return project;
    });
}
exports.removeFocus = removeFocus;
function uploadImage(projectUid, locationUid, src) {
    return __awaiter(this, void 0, void 0, function* () {
        const image = {
            projectUid,
            locationUid,
            src,
            uid: (0, nanoid_1.nanoid)(),
            addedDate: new Date().toISOString(),
        };
        yield db.collection(data_interfaces_1.DatabaseCollections.Images).add(image);
        return image;
    });
}
exports.uploadImage = uploadImage;
function fetchImages(projectUid, locationUid) {
    return __awaiter(this, void 0, void 0, function* () {
        const imagesSnapshot = yield db.collection(data_interfaces_1.DatabaseCollections.Images)
            .where('projectUid', '==', projectUid)
            .where('locationUid', '==', locationUid)
            .get();
        return imagesSnapshot.docs.map((is) => is.data());
    });
}
exports.fetchImages = fetchImages;
function removeImages(projectUid, locationUid, imageUids) {
    return __awaiter(this, void 0, void 0, function* () {
        const imageSnapshot = yield db.collection(data_interfaces_1.DatabaseCollections.Images)
            .where('projectUid', '==', projectUid)
            .where('locationUid', '==', locationUid)
            .where('uid', 'in', imageUids)
            .get();
        imageSnapshot.docs.forEach((doc) => {
            db.collection(data_interfaces_1.DatabaseCollections.Images).doc(doc.id).delete();
        });
    });
}
exports.removeImages = removeImages;
