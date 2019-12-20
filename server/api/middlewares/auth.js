import { AccessToken } from '@/lib/Tokens';

const auth = async (req, _, next) => {
  try {
    const { authorization } = req.headers;
    const user = AccessToken.verify(authorization);
    req.user = { ...user };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      err.status = 419;
      next(err);
    }
    err.status = 401;
    next(err);
  }
};

auth.expired = async (req, _, next) => {
  try {
    const { authorization } = req.headers;
    const user = AccessToken.verify(authorization, { ignoreExpiration: true });
    req.user = { ...user };
  } catch (err) {
    err.status(401);
    next(err);
  }
};

export default auth;
