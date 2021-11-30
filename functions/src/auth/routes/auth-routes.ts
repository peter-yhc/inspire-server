import Router from '@koa/router';

const authRouter = new Router();

authRouter.get('/login', (ctx) => {
  ctx.body = 'login endpoint';
});

export default authRouter;
