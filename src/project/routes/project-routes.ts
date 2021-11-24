import Router from '@koa/router';
import { ICreateProject } from './request-interfaces';

const projectRouter = new Router({ prefix: '/projects' });

projectRouter.get('/', (context) => {
  context.body = JSON.stringify([
    {
      id: 'taylor-home',
      name: 'Taylor Home',
      collections: [
        {
          id: 'itchen',
          name: 'Kitchen',
          subcollections: [
            {
              id: 'cabinets',
              name: 'Cabinets',
            },
            {
              id: 'windows',
              name: 'Windows',
            },
          ],
        },
      ],
    },
  ]);
});

projectRouter.post('/', (context) => {
  const request = context.request.body as ICreateProject;

  context.body = request.name; // use ID generated from DB
});

export default projectRouter;
