import Router from '@koa/router';
import { ICreateCollection, ICreateProject, ICreateSubCollection } from './request-interfaces';
import { createProject, getProjects } from '../../api/firebase-api';

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

projectRouter.post('/projects/:projectId/collections', (context) => {
  const request = context.request.body as ICreateCollection;

  context.body = request.name; // use ID generated from DB
});

projectRouter.post('/projects/:projectId/collections/:collectionId/subCollections', (context) => {
  const request = context.request.body as ICreateSubCollection;

  context.body = request.name; // use ID generated from DB
});

export default projectRouter;
