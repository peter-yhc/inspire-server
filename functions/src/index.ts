import Koa from 'koa';
import cors from '@koa/cors';
import * as functions from 'firebase-functions';
import { AuthRouter } from './auth';
import { ProjectRouter } from './project';
import { ImageRouter } from './images';
import { auth } from './api/firebase-api';

const app = new Koa();
app.use(cors());
app.use(async (context, next) => {
  // @ts-ignore
  context.request.body = context.req.body;
  await next();
});
app.use(async (context, next) => {
  const authHeader = context.request.headers.authorization as string;
  if (authHeader) {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    context.token = decodedToken.user_id;
    await next();
  }
});

app.use(AuthRouter.routes());
app.use(ProjectRouter.routes());
app.use(ImageRouter.routes());

app.listen(8081);

exports.app = functions.region('australia-southeast1').https.onRequest(app.callback());
