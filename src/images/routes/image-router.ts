import Router from '@koa/router';
import {
  canEdit, canRead, fetchImages, removeImages, uploadImage,
} from '../../api/firebase-api';
import { IDeleteImages, IUploadImage } from './image-requests';

const imageRouter = new Router();

imageRouter.post('/images', async (context) => {
  const request = (context.request.body as IUploadImage);
  if (!await canEdit(context.token, request.projectUid)) {
    context.status = 401;
    return;
  }

  context.body = await uploadImage(request.projectUid, request.locationUid, request.src);
  context.status = 201;
});

imageRouter.get('/images/:projectUid/:locationUid', async (context) => {
  if (!await canRead(context.token, context.params.projectUid)) {
    context.status = 401;
    return;
  }

  context.body = await fetchImages(context.params.projectUid, context.params.locationUid);
});

imageRouter.post('/images/:projectUid/:locationUid/delete', async (context) => {
  if (!await canEdit(context.token, context.params.projectUid)) {
    context.status = 401;
    return;
  }
  const request = context.request.body as IDeleteImages;
  await removeImages(context.params.projectUid, context.params.locationUid, request.uids);
  context.status = 201;
});

export default imageRouter;
