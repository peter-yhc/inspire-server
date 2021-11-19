import Router from '@koa/router';

const authRouter = new Router();

authRouter.get('/login', (ctx) => {
  ctx.body = 'login11122';
});

console.log('sdf');
export default authRouter;
