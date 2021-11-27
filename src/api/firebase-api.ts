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

export {
  createProject,
  getProjects,
};
