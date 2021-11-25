import bodyParser from 'koa-bodyparser';
import Koa from 'koa';
import { AuthRouter } from './auth';
import { ProjectRouter } from './project';

const port = 8081;
const app = new Koa();

app.use(bodyParser());
app.use(AuthRouter.routes());
app.use(ProjectRouter.routes());

app.listen(port);

console.info(`App started on port ${port}`);
