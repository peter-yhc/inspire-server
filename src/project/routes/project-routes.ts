import Router from '@koa/router';
import {
  IAddUserToProject, ICreateCollection, ICreateProject, ICreateSubCollection, IRemoveUserFromProject,
} from './request-interfaces';
import {
  addProjectUser, createProject, getProjects, isOwner, removeProjectUser,
} from '../../api/firebase-api';

const projectRouter = new Router({ prefix: '/projects' });
const userId = '3z3hoEDHoQfbLZ0gPp8J4o1JpcB3';

projectRouter.get('/', async (context) => {
  const projects = await getProjects(userId);
  context.body = JSON.stringify(projects);
});

projectRouter.post('/', async (context) => {
  const request = context.request.body as ICreateProject;

  context.body = await createProject(userId, request.name, 'Owner');
});

projectRouter.post('/:projectUuid/collections', (context) => {
  const request = context.request.body as ICreateCollection;

  context.body = request.name; // use ID generated from DB
});

projectRouter.post('/:projectUuid/collections/:collectionId/subCollections', (context) => {
  const request = context.request.body as ICreateSubCollection;

  context.body = request.name; // use ID generated from DB
});

projectRouter.post('/:projectUuid/users', async (context) => {
  const request = context.request.body as IAddUserToProject;
  if (!await isOwner(userId, context.params.projectUuid)) {
    return context.status = 401;
  }

  await addProjectUser(request.userEmail, context.params.projectUuid, request.role);
  context.status = 200;
});

projectRouter.delete('/:projectUuid/users', async (context) => {
  const request = context.request.body as IRemoveUserFromProject;
  if (!await isOwner(userId, context.params.projectUuid)) {
    return context.status = 401;
  }
  await removeProjectUser(request.userEmail, context.params.projectUuid);
  context.status = 200;
});

export default projectRouter;
