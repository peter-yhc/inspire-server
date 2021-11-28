import Router from '@koa/router';
import {
  IAddUserToProject, ICreateCollection, ICreateFocus, ICreateProject, IRemoveUserFromProject,
} from './request-interfaces';
import {
  addProjectUser,
  createCollection, createFocus,
  createProject,
  getProjects,
  isObserver,
  isOwner,
  removeCollection, removeFocus,
  removeProjectUser,
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
  context.status = 201;
});

projectRouter.post('/:projectUuid/users', async (context) => {
  const request = context.request.body as IAddUserToProject;
  if (!await isOwner(userId, context.params.projectUuid)) {
    context.status = 401;
    return;
  }

  await addProjectUser(request.userEmail, context.params.projectUuid, request.role);
  context.status = 201;
});

projectRouter.delete('/:projectUuid/users', async (context) => {
  const request = context.request.body as IRemoveUserFromProject;
  if (!await isOwner(userId, context.params.projectUuid)) {
    context.status = 401;
    return;
  }
  await removeProjectUser(request.userEmail, context.params.projectUuid);
  context.status = 200;
});

projectRouter.post('/:projectUuid/collections', async (context) => {
  const request = context.request.body as ICreateCollection;
  if (await isObserver(userId, context.params.projectUuid)) {
    context.status = 401;
    return;
  }
  await createCollection(context.params.projectUuid, request.name);
  context.status = 201;
});

projectRouter.delete('/:projectUuid/collections/:collectionUuid', async (context) => {
  if (await isObserver(userId, context.params.projectUuid)) {
    context.status = 401;
    return;
  }
  await removeCollection(context.params.projectUuid, context.params.collectionUuid);
  context.status = 200;
});

projectRouter.post('/:projectUuid/collections/:collectionUuid/focuses', async (context) => {
  const request = context.request.body as ICreateFocus;
  if (await isObserver(userId, context.params.projectUuid)) {
    context.status = 401;
    return;
  }
  await createFocus(context.params.projectUuid, context.params.collectionUuid, request.name);
  context.status = 201;
});

projectRouter.delete('/:projectUuid/collections/:collectionUuid/focuses/:focusUuid', async (context) => {
  if (await isObserver(userId, context.params.projectUuid)) {
    context.status = 401;
    return;
  }
  await removeFocus(context.params.projectUuid, context.params.collectionUuid, context.params.focusUuid);
  context.status = 200;
});

export default projectRouter;
