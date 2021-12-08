import Router from '@koa/router';
import PasswordValidator from 'password-validator';
import { auth } from '../../api/firebase-api';
import { ICreateUser } from './auth-requests';

const passwordSchema = new PasswordValidator();
passwordSchema
  .is().min(6).max(20)
  .has()
  .uppercase()
  .lowercase()
  .digits();

const authRouter = new Router();

authRouter.get('/login', (ctx) => {
  ctx.body = 'login endpoint';
});

authRouter.post('/signup', async (ctx) => {
  const request = ctx.request.body as ICreateUser;

  if (!passwordSchema.validate(request.password)) {
    ctx.status = 401;
    ctx.body = 'Bad password';
    return;
  }

  await auth.createUser({
    email: request.email,
    password: request.password,
  });

  ctx.status = 200;
});

export default authRouter;
