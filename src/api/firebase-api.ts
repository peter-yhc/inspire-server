import * as admin from 'firebase-admin';
import { IProject } from './data-interfaces';

// eslint-disable-next-line import/no-absolute-path
const serviceAccount = require('D:\\inspire-dev.json');

const options = process.env.NODE_ENV !== 'production'
  ? { credential: admin.credential.cert(serviceAccount) }
  : undefined;

const app = admin.initializeApp(options);
const db = admin.firestore(app);

async function getProjects(userId: string): Promise<IProject[]> {
  const projectPermissions = await db.collection('ProjectPermissions')
    .where('userId', '==', userId)
    .get();

  const projectUuids = projectPermissions.docs.map((projectPermission) => projectPermission.get('projectId'));
  const projectSnapshot = await db.collection('Projects')
    .where('uuid', 'in', projectUuids)
    .get();

  return projectSnapshot.docs.map((project) => project.data()) as IProject[];
}

export {
  getProjects,
};
