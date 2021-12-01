import Router from '@koa/router';
import {
  IAddUserToProject,
  ICreateCollection,
  ICreateFocus,
  ICreateProject,
  IRemoveUserFromProject,
} from './request-interfaces';
import {
  addProjectUser,
  canEdit,
  createCollection,
  createFocus,
  createProject,
  getProjects,
  isOwner,
  removeCollection,
  removeFocus,
  removeProjectUser,
} from '../../api/firebase-api';

const projectRouter = new Router({ prefix: '/projects' });

projectRouter.get('/', async (context) => {
  const projects = await getProjects(context.token);
  context.body = JSON.stringify(projects);
});

projectRouter.post('/', async (context) => {
  const request = context.request.body as ICreateProject;

  context.body = await createProject(context.token, request.name, 'Owner');
  context.status = 201;
});

projectRouter.post('/:projectUid/users', async (context) => {
  const request = context.request.body as IAddUserToProject;
  if (!await isOwner(context.token, context.params.projectUid)) {
    context.status = 401;
    return;
  }

  await addProjectUser(request.userEmail, context.params.projectUid, request.role);
  context.status = 201;
});

projectRouter.delete('/:projectUid/users', async (context) => {
  const request = context.request.body as IRemoveUserFromProject;
  if (!await isOwner(context.token, context.params.projectUid)) {
    context.status = 401;
    return;
  }
  await removeProjectUser(request.userEmail, context.params.projectUid);
  context.status = 200;
});

projectRouter.post('/:projectUid/collections', async (context) => {
  const request = context.request.body as ICreateCollection;
  if (!await canEdit(context.token, context.params.projectUid)) {
    context.status = 401;
    return;
  }

  context.body = await createCollection(context.params.projectUid, request.name);
  context.status = 201;
});

projectRouter.delete('/:projectUid/collections/:collectionUid', async (context) => {
  if (!await canEdit(context.token, context.params.projectUid)) {
    context.status = 401;
    return;
  }
  context.body = await removeCollection(context.params.projectUid, context.params.collectionUid);
  context.status = 200;
});

projectRouter.post('/:projectUid/collections/:collectionUid/focuses', async (context) => {
  const request = context.request.body as ICreateFocus;
  if (!await canEdit(context.token, context.params.projectUid)) {
    context.status = 401;
    return;
  }
  context.body = await createFocus(context.params.projectUid, context.params.collectionUid, request.name);
  context.status = 201;
});

projectRouter.delete('/:projectUid/collections/:collectionUid/focuses/:focusUid', async (context) => {
  if (!await canEdit(context.token, context.params.projectUid)) {
    context.status = 401;
    return;
  }
  context.body = await removeFocus(context.params.projectUid, context.params.collectionUid, context.params.focusUid);
  context.status = 200;
});

export default projectRouter;
