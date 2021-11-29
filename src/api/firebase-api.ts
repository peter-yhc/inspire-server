import * as admin from 'firebase-admin';
import {
  DatabaseCollections, ICollection, IFocus, IImage, IProject, IProjectRoleMapping, ProjectRole,
} from './data-interfaces';
import { firestore } from 'firebase-admin';
import { nanoid } from 'nanoid';
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;
import DocumentData = firestore.DocumentData;

// eslint-disable-next-line import/no-absolute-path
const serviceAccount = require('D:\\inspire-dev.json');

const options = process.env.NODE_ENV !== 'production'
  ? { credential: admin.credential.cert(serviceAccount) }
  : undefined;

const app = admin.initializeApp(options);
const db = admin.firestore(app);
const auth = admin.auth(app);

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

async function uploadImage(projectUid: string, locationUid: string, src: string): Promise<IImage> {
  const image: IImage = {
    projectUid,
    locationUid,
    src,
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
  auth,
};
