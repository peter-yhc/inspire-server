import * as admin from 'firebase-admin';
import {
  DatabaseCollections, IFocus, IProject, IProjectRoleMapping, ProjectRole,
} from './data-interfaces';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from 'firebase-admin';
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

async function checkProjectRole(userId: string, projectUuid: string, role: ProjectRole) {
  const projectRoleMappings = await db.collection(DatabaseCollections.ProjectRoleMappings)
    .where('userId', '==', userId)
    .where('projectUuid', '==', projectUuid)
    .where('role', '==', role)
    .get();

  return !!projectRoleMappings.docs.pop();
}

async function isOwner(userId: string, projectUuid: string) {
  return checkProjectRole(userId, projectUuid, 'Owner');
}

async function isObserver(userId: string, projectUuid: string) {
  return checkProjectRole(userId, projectUuid, 'Observer');
}

async function getProjectDocument(projectUuid: string): Promise<QueryDocumentSnapshot<DocumentData> | undefined> {
  const projectSnapshot = await db.collection(DatabaseCollections.Projects)
    .where('uuid', '==', projectUuid)
    .get();

  return projectSnapshot.docs.pop();
}

async function getProjects(userId: string): Promise<IProject[]> {
  const projectRoleMappings = await db.collection(DatabaseCollections.ProjectRoleMappings)
    .where('userId', '==', userId)
    .get();

  const projectUuids = projectRoleMappings.docs
    .map((projectRoleMapping) => projectRoleMapping.data().projectUuid);
  const projectSnapshot = await db.collection(DatabaseCollections.Projects)
    .where('uuid', 'in', projectUuids)
    .get();

  return projectSnapshot.docs.map((project) => project.data()) as IProject[];
}

async function createProject(userId: string, name: string, role: ProjectRole): Promise<IProject> {
  const projectUuid = uuidv4();
  await db.collection(DatabaseCollections.Projects).add({ name, uuid: projectUuid, collections: [] });
  await db.collection(DatabaseCollections.ProjectRoleMappings)
    .add({ userId, projectUuid, role } as IProjectRoleMapping);

  return {
    name,
    uuid: projectUuid,
    collections: [],
  };
}

async function addProjectUser(userEmail: string, projectUuid: string, role: ProjectRole): Promise<void> {
  const user = await auth.getUserByEmail(userEmail);
  const userProjectMappingSnapshot = await db.collection(DatabaseCollections.ProjectRoleMappings)
    .where('userId', '==', user.uid)
    .where('projectUuid', '==', projectUuid)
    .get();

  const userMappingId = userProjectMappingSnapshot.docs.pop()?.id;
  if (userMappingId) {
    await db.collection(DatabaseCollections.ProjectRoleMappings).doc(userMappingId).set({
      userId: user.uid,
      projectUuid,
      role,
    } as IProjectRoleMapping);
  } else {
    await db.collection(DatabaseCollections.ProjectRoleMappings).add({
      userId: user.uid,
      projectUuid,
      role,
    } as IProjectRoleMapping);
  }
}

async function removeProjectUser(userEmail: string, projectUuid: string): Promise<void> {
  const user = await auth.getUserByEmail(userEmail);

  const userMappingSnapshot = await db.collection(DatabaseCollections.ProjectRoleMappings)
    .where('userId', '==', user.uid)
    .where('projectUuid', '==', projectUuid)
    .get();

  const userMappingId = userMappingSnapshot.docs.pop()?.id;
  if (userMappingId) {
    await db.collection(DatabaseCollections.ProjectRoleMappings).doc(userMappingId).delete();
  }
}

async function createCollection(projectUuid: string, collectionName: string) {
  const projectSnapshot = await db.collection(DatabaseCollections.Projects)
    .where('uuid', '==', projectUuid)
    .get();

  const projectDoc = projectSnapshot.docs.pop();
  if (!projectDoc) {
    throw new Error('Project does not exist.');
  }
  const project = projectDoc.data() as IProject;
  project.collections = [...project.collections, { name: collectionName, uuid: uuidv4(), focuses: [] }];

  await db.collection(DatabaseCollections.Projects).doc(projectDoc.id).set(project);
}

async function removeCollection(projectUuid: string, collectionUuid: string) {
  const projectDoc = await getProjectDocument(projectUuid);
  if (!projectDoc) {
    throw new Error('Project does not exist.');
  }
  const project = projectDoc.data() as IProject;
  project.collections = project.collections.filter((collection) => collection.uuid !== collectionUuid);

  await db.collection(DatabaseCollections.Projects).doc(projectDoc.id).set(project);
}

async function createFocus(projectUuid: string, collectionUuid: string, focusName: string) {
  const projectDoc = await getProjectDocument(projectUuid);
  if (!projectDoc) {
    throw new Error('Project does not exist.');
  }
  const project = projectDoc.data() as IProject;
  const collection = project.collections.find((collection) => collection.uuid === collectionUuid);

  if (!collection) {
    throw new Error('Collection does not exist.');
  }
  collection.focuses.push({ name: focusName, uuid: uuidv4() } as IFocus);

  await db.collection(DatabaseCollections.Projects).doc(projectDoc.id).set(project);
}

async function removeFocus(projectUuid: string, collectionUuid: string, focusUuid: string) {
  const projectSnapshot = await db.collection(DatabaseCollections.Projects)
    .where('uuid', '==', projectUuid)
    .get();

  const projectDoc = projectSnapshot.docs.pop();
  if (!projectDoc) {
    throw new Error('Project does not exist.');
  }
  const project = projectDoc.data() as IProject;
  const collection = project.collections.find((collection) => collection.uuid === collectionUuid);

  if (!collection) {
    throw new Error('Collection does not exist.');
  }
  collection.focuses.filter((focus) => focus.uuid !== focusUuid);

  await db.collection(DatabaseCollections.Projects).doc(projectDoc.id).set(project);
}

export {
  isOwner,
  isObserver,
  createProject,
  getProjects,
  addProjectUser,
  removeProjectUser,
  createCollection,
  removeCollection,
  createFocus,
  removeFocus,
};
