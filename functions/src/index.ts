/* eslint-disable import/no-import-module-exports */
import Koa from 'koa';
import cors from '@koa/cors';
import * as functions from 'firebase-functions';
import bodyParser from 'koa-bodyparser';
import { AuthRouter } from './auth';
import { ProjectRouter } from './project';
import { ImageRouter } from './images';
import { auth } from './api/firebase-api';
import { whitelistedRoutes } from './route-whitelist';

const app = new Koa();
app.use(cors());
if (process.env.NODE_ENV === 'dev') {
  app.use(bodyParser());
} else {
  app.use(async (context, next) => {
    // @ts-ignore
    context.request.body = context.req.body;
    await next();
  });
}

app.use(async (ctx, next) => {
  if (whitelistedRoutes.includes(ctx.request.url)) {
    await next();
    return;
  }
  const authHeader = ctx.request.headers.authorization as string;
  if (authHeader) {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    ctx.token = decodedToken.user_id;
    await next();
  }
});

app.use(AuthRouter.routes());
app.use(ProjectRouter.routes());
app.use(ImageRouter.routes());

if (process.env.NODE_ENV === 'dev') {
  app.listen(8081);
  console.info('app started on port 8081');
}

exports.app = functions.region('australia-southeast1').https.onRequest(app.callback());
