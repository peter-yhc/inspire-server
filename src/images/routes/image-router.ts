import Router from '@koa/router';

const imageRouter = new Router();

imageRouter.post('/upload-image', (context) => {
  // check user has access to project
  // check project exists
  // upload image to path

  context.body = 'uploading images';
});
