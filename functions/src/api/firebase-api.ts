import * as admin from 'firebase-admin';
import { firestore } from 'firebase-admin';
import { nanoid } from 'nanoid';
import fs from 'fs';
import {
  DatabaseCollections, ICollection, IFocus, IImage, IProject, IProjectRoleMapping, ProjectRole,
} from './data-interfaces';
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;
import DocumentData = firestore.DocumentData;
import { IMoveBatchImages, IUpdateImage } from '../images/routes/image-requests';
import FieldValue = firestore.FieldValue;

let options;
if (process.env.NODE_ENV === 'dev') {
// eslint-disable-next-line import/no-absolute-path,global-require
  const serviceAccount = require('D:\\inspire-dev.json');
  options = { credential: admin.credential.cert(serviceAccount) };
}

const bucketName = 'inspire-dev-ad92f.appspot.com';
const app = admin.initializeApp(options);
const db = admin.firestore(app);
const auth = admin.auth(app);
const store = admin.storage(app);
const tempFolder = process.env.TMP || '/tmp';

async function isOwner(userId: string, projectUid: string) {
  const projectRoleMappings = await db.collection(DatabaseCollections.ProjectRoleMappings)
    .where('userId', '==', userId)
    .where('projectUid', '==', projectUid)
    .where('role', '==', 'Owner')
    .get();

  return !!projectRoleMappings.docs.pop();
}

async function canEdit(userId: string, projectUid: string) {
  const projectRoleMappings = await db.collection(DatabaseCollections.ProjectRoleMappings)
    .where('userId', '==', userId)
    .where('projectUid', '==', projectUid)
    .where('role', 'in', ['Owner', 'Editor'])
    .get();

  return !!projectRoleMappings.docs.pop();
}

async function canRead(userId: string, projectUid: string) {
  const projectRoleMappings = await db.collection(DatabaseCollections.ProjectRoleMappings)
    .where('userId', '==', userId)
    .where('projectUid', '==', projectUid)
    .get();

  return !!projectRoleMappings.docs.pop();
}

async function getProjectDocument(projectUid: string): Promise<QueryDocumentSnapshot<DocumentData> | undefined> {
  const projectSnapshot = await db.collection(DatabaseCollections.Projects)
    .where('uid', '==', projectUid)
    .get();

  return projectSnapshot.docs.pop();
}

async function getProjects(userId: string): Promise<IProject[]> {
  const projectRoleMappings = await db.collection(DatabaseCollections.ProjectRoleMappings)
    .where('userId', '==', userId)
    .get();

  const projectUids = projectRoleMappings.docs
    .map((projectRoleMapping) => projectRoleMapping.data().projectUid);
  const projectSnapshot = await db.collection(DatabaseCollections.Projects)
    .where('uid', 'in', projectUids)
    .get();

  return projectSnapshot.docs.map((project) => project.data()) as IProject[];
}

async function createProject(userId: string, name: string, role: ProjectRole): Promise<IProject> {
  const projectUid = nanoid();
  await db.collection(DatabaseCollections.Projects).add({ name, uid: projectUid, collections: [] });
  await db.collection(DatabaseCollections.ProjectRoleMappings)
    .add({ userId, projectUid, role } as IProjectRoleMapping);

  return {
    name,
    uid: projectUid,
    collections: [],
  };
}

async function addProjectUser(userEmail: string, projectUid: string, role: ProjectRole) {
  const user = await auth.getUserByEmail(userEmail);
  const userProjectMappingSnapshot = await db.collection(DatabaseCollections.ProjectRoleMappings)
    .where('userId', '==', user.uid)
    .where('projectUid', '==', projectUid)
    .get();

  const userMappingId = userProjectMappingSnapshot.docs.pop()?.id;
  if (userMappingId) {
    await db.collection(DatabaseCollections.ProjectRoleMappings).doc(userMappingId).set({
      userId: user.uid,
      projectUid,
      role,
    } as IProjectRoleMapping);
  } else {
    await db.collection(DatabaseCollections.ProjectRoleMappings).add({
      userId: user.uid,
      projectUid,
      role,
    } as IProjectRoleMapping);
  }
}

async function removeProjectUser(userEmail: string, projectUid: string) {
  const user = await auth.getUserByEmail(userEmail);

  const userMappingSnapshot = await db.collection(DatabaseCollections.ProjectRoleMappings)
    .where('userId', '==', user.uid)
    .where('projectUid', '==', projectUid)
    .get();

  const userMappingId = userMappingSnapshot.docs.pop()?.id;
  if (userMappingId) {
    await db.collection(DatabaseCollections.ProjectRoleMappings).doc(userMappingId).delete();
  }
}

async function createCollection(projectUid: string, collectionName: string): Promise<ICollection> {
  const projectSnapshot = await db.collection(DatabaseCollections.Projects)
    .where('uid', '==', projectUid)
    .get();

  const projectDoc = projectSnapshot.docs.pop();
  if (!projectDoc) {
    throw new Error('Project does not exist.');
  }
  const project = projectDoc.data() as IProject;
  const newCollection = { name: collectionName, uid: nanoid(), focuses: [] };
  project.collections = [...project.collections, newCollection];

  await db.collection(DatabaseCollections.Projects).doc(projectDoc.id).set(project);
  return newCollection;
}

async function removeCollection(projectUid: string, collectionUid: string) {
  const projectDoc = await getProjectDocument(projectUid);
  if (!projectDoc) {
    throw new Error('Project does not exist.');
  }
  const project = projectDoc.data() as IProject;
  project.collections = project.collections.filter((collection) => collection.uid !== collectionUid);

  await db.collection(DatabaseCollections.Projects).doc(projectDoc.id).set(project);
  return project;
}

async function createFocus(projectUid: string, collectionUid: string, focusName: string): Promise<IFocus> {
  const projectDoc = await getProjectDocument(projectUid);
  if (!projectDoc) {
    throw new Error('Project does not exist.');
  }
  const project = projectDoc.data() as IProject;
  const collection = project.collections.find((collection) => collection.uid === collectionUid);

  if (!collection) {
    throw new Error('Collection does not exist.');
  }
  const newFocus: IFocus = { name: focusName, uid: nanoid() };
  collection.focuses.push(newFocus);

  await db.collection(DatabaseCollections.Projects).doc(projectDoc.id).set(project);
  return newFocus;
}

async function removeFocus(projectUid: string, collectionUid: string, focusUid: string) {
  const projectSnapshot = await db.collection(DatabaseCollections.Projects)
    .where('uid', '==', projectUid)
    .get();

  const projectDoc = projectSnapshot.docs.pop();
  if (!projectDoc) {
    throw new Error('Project does not exist.');
  }
  const project = projectDoc.data() as IProject;
  const collection = project.collections.find((collection) => collection.uid === collectionUid);

  if (!collection) {
    throw new Error('Collection does not exist.');
  }
  collection.focuses.filter((focus) => focus.uid !== focusUid);

  await db.collection(DatabaseCollections.Projects).doc(projectDoc.id).set(project);
  return project;
}

async function uploadImage(projectUid: string, locationUid: string, src: string, fileName: string): Promise<IImage> {
  let imageData = src;
  if (!imageData.includes('http')) {
    const path = `${tempFolder}/${fileName}`;

    const buff = Buffer.from(imageData, 'base64');
    fs.writeFileSync(path, buff);
    const extension = fileName.split('.')[1];
    const [storageFile] = await store
      .bucket(bucketName)
      .upload(path, {
        gzip: true,
        metadata: {
          firebaseStorageDownloadTokens: nanoid(),
          contentType: `image/${extension}`,
        },
      });

    await storageFile.makePublic();
    imageData = storageFile.publicUrl();
  }

  const image: IImage = {
    projectUid,
    locationUid,
    src: imageData,
    uid: nanoid(),
    addedDate: new Date().toISOString(),
  };
  await db.collection(DatabaseCollections.Images).add(image);
  return image;
}

async function fetchImages(projectUid: string, locationUid: string): Promise<IImage[]> {
  const imagesSnapshot = await db.collection(DatabaseCollections.Images)
    .where('projectUid', '==', projectUid)
    .where('locationUid', '==', locationUid)
    .get();

  return imagesSnapshot.docs.map((is) => is.data() as IImage);
}

async function removeImages(projectUid: string, locationUid: string, imageUids: string[]) {
  const imageSnapshot = await db.collection(DatabaseCollections.Images)
    .where('projectUid', '==', projectUid)
    .where('locationUid', '==', locationUid)
    .where('uid', 'in', imageUids)
    .get();

  imageSnapshot.docs.forEach((doc) => {
    db.collection(DatabaseCollections.Images).doc(doc.id).delete();
  });
}

async function updateImage(projectUid: string, locationUid: string, imageUid: string, update: IUpdateImage): Promise<IImage> {
  const imageSnapshot = await db.collection(DatabaseCollections.Images)
    .where('projectUid', '==', projectUid)
    .where('locationUid', '==', locationUid)
    .where('uid', '==', imageUid)
    .get();

  const imageDoc = imageSnapshot.docs.pop();
  if (!imageDoc) {
    throw new Error(`Image ${imageUid} does not exist.`);
  }
  const imageData = {
    ...imageDoc.data(),
    ...(update.comment) && { comment: update.comment },
    ...(update.metadata) && { metadata: update.metadata },
  } as IImage;
  await db.collection(DatabaseCollections.Images).doc(imageDoc.id).set(imageData);
  return imageData;
}

async function removeImageComment(projectUid: string, locationUid: string, imageUid: string): Promise<IImage> {
  const imageSnapshot = await db.collection(DatabaseCollections.Images)
    .where('projectUid', '==', projectUid)
    .where('locationUid', '==', locationUid)
    .where('uid', '==', imageUid)
    .get();

  const imageDoc = imageSnapshot.docs.pop();
  if (!imageDoc) {
    throw new Error(`Image ${imageUid} does not exist.`);
  }

  const imageData = {
    ...imageDoc.data(),
    comment: undefined,
  } as IImage;
  await db.collection(DatabaseCollections.Images).doc(imageDoc.id).update({ comment: FieldValue.delete() });

  delete imageData.comment;
  return imageData;
}

async function moveImages(projectUid: string, locationUid: string, update: IMoveBatchImages): Promise<IImage[]> {
  const imageSnapshot = await db.collection(DatabaseCollections.Images)
    .where('projectUid', '==', projectUid)
    .where('locationUid', '==', locationUid)
    .where('uid', 'in', update.imageUids)
    .get();

  const result: IImage[] = [];

  imageSnapshot.docs.forEach((doc) => {
    const imageData = { ...doc.data(), locationUid: update.newLocationUid } as IImage;
    db.collection(DatabaseCollections.Images).doc(doc.id).set(imageData);
    result.push(imageData);
  });

  return result;
}

export {
  isOwner,
  canEdit,
  canRead,
  createProject,
  getProjects,
  addProjectUser,
  removeProjectUser,
  createCollection,
  removeCollection,
  createFocus,
  removeFocus,
  uploadImage,
  fetchImages,
  removeImages,
  updateImage,
  removeImageComment,
  moveImages,
  auth,
};
