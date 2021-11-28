import Router from '@koa/router';
import {
  canEdit, canRead, fetchImages, uploadImage,
} from '../../api/firebase-api';
import { IUploadImage } from './image-requests';

const imageRouter = new Router();
const userId = '3z3hoEDHoQfbLZ0gPp8J4o1JpcB3';

imageRouter.post('/upload-image', async (context) => {
  const request = (context.request.body as IUploadImage);
  if (await canEdit(userId, request.projectUid)) {
    context.status = 401;
    return;
  }

  await uploadImage(request.projectUid, request.locationUid, request.src);
  context.status = 201;
});

imageRouter.get('/images/:projectUid/:locationUid', async (context) => {
  if (!await canRead(userId, context.params.projectUid)) {
    context.status = 401;
    return;
  }

  context.body = await fetchImages(context.params.projectUid, context.params.locationUid);
  context.status = 200;
});

export default imageRouter;
