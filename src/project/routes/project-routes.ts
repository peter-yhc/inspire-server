import Router from '@koa/router';
import { ICreateCollection, ICreateProject, ICreateSubCollection } from './request-interfaces';
import { getProjects } from '../../api/firebase-api';

const projectRouter = new Router({ prefix: '/projects' });

projectRouter.get('/', async (context) => {
  const projects = await getProjects('3z3hoEDHoQfbLZ0gPp8J4o1JpcB3');
  context.body = JSON.stringify(projects);
});

projectRouter.post('/', (context) => {
  const request = context.request.body as ICreateProject;

  context.body = request.name; // use ID generated from DB
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
