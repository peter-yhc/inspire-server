import Router from '@koa/router';
import {
  canEdit, canRead, copyImages, fetchImages, moveImages, removeImageComment, removeImages, updateImage, uploadImage,
} from '../../api/firebase-api';
import {
  ICopyBatchImages,
  IDeleteImages, IMoveBatchImages, IUpdateImage, IUploadImage,
} from './image-requests';

const imageRouter = new Router();

imageRouter.post('/images', async (context) => {
  const request = (context.request.body as IUploadImage);
  if (!await canEdit(context.token, request.projectUid)) {
    context.status = 401;
    return;
  }

  context.body = await uploadImage(request.projectUid, request.locationUid, request.src, request.fileName);
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

imageRouter.put('/images/:projectUid/:locationUid/:imageUid', async (context) => {
  if (!await canEdit(context.token, context.params.projectUid)) {
    context.status = 401;
    return;
  }

  const request = context.request.body as IUpdateImage;
  context.body = await updateImage(
    context.params.projectUid,
    context.params.locationUid,
    context.params.imageUid,
    request,
  );
  context.status = 200;
});

imageRouter.put('/images/:projectUid/:locationUid', async (context) => {
  if (!await canEdit(context.token, context.params.projectUid)) {
    context.status = 401;
    return;
  }

  const request = context.request.body as IMoveBatchImages;
  context.body = await moveImages(
    context.params.projectUid,
    context.params.locationUid,
    request,
  );
  context.status = 200;
});

imageRouter.post('/images/:projectUid/:locationUid/clone', async (context) => {
  if (!await canEdit(context.token, context.params.projectUid)) {
    context.status = 401;
    return;
  }

  const request = context.request.body as ICopyBatchImages;
  context.body = await copyImages(
    context.params.projectUid,
    context.params.locationUid,
    request,
  );
  context.status = 200;
});

imageRouter.delete('/images/:projectUid/:locationUid/:imageUid/comments', async (context) => {
  if (!await canEdit(context.token, context.params.projectUid)) {
    context.status = 401;
    return;
  }

  context.body = await removeImageComment(
    context.params.projectUid,
    context.params.locationUid,
    context.params.imageUid,
  );
  context.status = 200;
});

export default imageRouter;
