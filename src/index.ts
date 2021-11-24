import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import Koa from 'koa';
import { AuthRouter } from './auth';
import { ProjectRouter } from './project';

const port = 8081;
const app = new Koa();
const router = new Router();

router.get('/hello', (ctx) => {
  ctx.body = 'hi';
});

app.use(bodyParser());
app.use(router.routes());
app.use(AuthRouter.routes());
app.use(ProjectRouter.routes());

app.listen(port);

console.info(`App started on port ${port}`);
