import bodyParser from 'koa-bodyparser';
import Koa from 'koa';
import cors from '@koa/cors';
import { AuthRouter } from './auth';
import { ProjectRouter } from './project';
import { ImageRouter } from './images';
import { auth } from './api/firebase-api';

const port = 8081;
const app = new Koa();

app.use(cors());
app.use(bodyParser());

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

app.listen(port);

console.info(`App started on port ${port}`);
