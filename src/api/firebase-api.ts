import * as admin from 'firebase-admin';
import { IProject, IProjectRoleMapping, ProjectRole } from './data-interfaces';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line import/no-absolute-path
const serviceAccount = require('D:\\inspire-dev.json');

const options = process.env.NODE_ENV !== 'production'
  ? { credential: admin.credential.cert(serviceAccount) }
  : undefined;

const app = admin.initializeApp(options);
const db = admin.firestore(app);
const auth = admin.auth(app);

async function checkProjectRole(userId: string, projectUuid: string, role: ProjectRole) {
  const projectRoleMappings = await db.collection('ProjectRoleMappings')
      .where('userId', '==', userId)
      .where('projectUuid', '==', projectUuid)
      .where('role', '==', role)
      .get();

  return !!projectRoleMappings.docs.pop();
}

async function isOwner(userId: string, projectUuid: string) {
  return checkProjectRole(userId, projectUuid, 'Owner')
}

async function isObserver(userId: string, projectUuid: string) {
  return checkProjectRole(userId, projectUuid, 'Observer')
}

async function getProjects(userId: string): Promise<IProject[]> {
  const projectRoleMappings = await db.collection('ProjectRoleMappings')
    .where('userId', '==', userId)
    .get();

  const projectUuids = projectRoleMappings.docs
    .map((projectRoleMapping) => projectRoleMapping.data().projectUuid);
  const projectSnapshot = await db.collection('Projects')
    .where('uuid', 'in', projectUuids)
    .get();

  return projectSnapshot.docs.map((project) => project.data()) as IProject[];
}

async function createProject(userId: string, name: string, role: ProjectRole): Promise<IProject> {
  const projectUuid = uuidv4();
  await db.collection('Projects').add({ name, uuid: projectUuid, collections: [] });
  await db.collection('ProjectRoleMappings')
    .add({ userId, projectUuid, role } as IProjectRoleMapping);

  return {
    name,
    uuid: projectUuid,
    collections: [],
  };
}

async function addProjectUser(userEmail: string, projectUuid: string, role: ProjectRole): Promise<void> {
  const user = await auth.getUserByEmail(userEmail);
  const userProjectMappingSnapshot = await db.collection('ProjectRoleMappings')
    .where('userId', '==', user.uid)
    .where('projectUuid', '==', projectUuid)
    .get();

  const userMappingId = userProjectMappingSnapshot.docs.pop()?.id;
  if (userMappingId) {
    await db.collection('ProjectRoleMappings').doc(userMappingId).set({
      userId: user.uid,
      projectUuid,
      role,
    } as IProjectRoleMapping);
  } else {
    await db.collection('ProjectRoleMappings').add({
      userId: user.uid,
      projectUuid,
      role,
    } as IProjectRoleMapping);
  }
}

async function removeProjectUser(userEmail: string, projectUuid: string): Promise<void> {
  const user = await auth.getUserByEmail(userEmail);

  const userMappingSnapshot = await db.collection('ProjectRoleMappings')
    .where('userId', '==', user.uid)
    .where('projectUuid', '==', projectUuid)
    .get();

  const userMappingId = userMappingSnapshot.docs.pop()?.id;
  if (userMappingId) {
    await db.collection('ProjectRoleMappings').doc(userMappingId).delete();
  }
}

async function createCollection() {

}

export {
  isOwner,
  isObserver,
  createProject,
  getProjects,
  addProjectUser,
  removeProjectUser,
};
