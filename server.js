const path = require('path');
const fs = require('fs');

const jsonServer = require('json-server');
const auth = require('json-server-auth');

const jwt_decode = require('jwt-decode');
// const JWT_SECRET_KEY =
//   require('./node_modules/json-server-auth/dist/constants').JWT_SECRET_KEY;

const port = process.env.PORT || 3000;

const server = jsonServer.create();
const router = jsonServer.router('./data/db.json');
const middlewares = jsonServer.defaults();

const rules = auth.rewriter({
  /**
   * #NOTE: Use custom router with auth here
   */
  '/api/*': '/$1',
  // Permission rules
  users: 600,
  // users: 640,

  posts: 664,
  bookmarks: 600,

  postLikes: 664,
  // Other rules
  // '/posts/:category': '/posts?category=:category',
});
/* end of auth-rules */

const writableMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
/* end of definitions */

function decodeJWTsID({ req }) {
  console.log('decode!');

  const token = req.header('Authorization')
    ? req.header('Authorization').replace('Bearer ', '')
    : null;

  if (token) {
    const decoded = jwt_decode(token);
    // console.log({ token, JWT_SECRET_KEY, decoded });
    const intSub = Number(decoded.sub);
    console.log('subId:::', intSub);

    return intSub;
  }
  /* end of IF-token */

  return 0;
}
/* end of decodeJWTsID({ req }) */

function isAdminAuth({ req, res, next }) {
  console.log('isAdminAuth!');
  const subUserId = decodeJWTsID({ req });

  // #REVIEW:
  if (subUserId !== 1) {
    return res
      .status(401)
      .jsonp({ message: 'Not A ADMIN!', success: false, status: 401 });
  }
  /* end of IF-Id */
  req.body.userId = subUserId || null;

  return next();
}
/* end of isAdminAuth({ req, res, next }) */

/* end of helper-function */

// /!\ Bind the router db to the app server
server.db = router.db;

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);

server.post('/signin', (req, res, next) => {
  // server.post('/signin', auth, (req, res, next) => {
  console.log('ADMIN-SIGNIN!');

  console.log(req.body);
  const reqEmail = req?.body?.email || '';
  // console.log(req.app);
  const { db } = req.app;
  const user = db.get('users').find({ email: reqEmail }).value() || null;
  // console.log(user);
  const userId = user?.id || 0;
  console.log('userId:::', userId);

  if (userId !== 1) {
    return res
      .status(401)
      .jsonp({ message: 'Not A ADMIN!', success: false, status: 401 });
  }

  // return isAdminAuth({ req, res, next });
  next();
});
/* end of post('/signin*') */

server.use('/api/posts', (req, res, next) => {
  console.log('/api/posts!');

  const isWritableMethod = writableMethods.includes(req.method);
  if (isWritableMethod) {
    console.log('Method:::', req.method);

    return isAdminAuth({ req, res, next });
  }
  /* end of IF-(isWritableMethod) */
  console.log('isWritableMethod:::', isWritableMethod);

  next();
});
/* end of use('/api/posts') */

server.post('/api/*', (req, res, next) => {
  console.log('POST!');

  // #REVIEWS:
  const subUserId = decodeJWTsID({ req });
  req.body.userId = subUserId || null;

  // req.body.createdAt = Date.now();
  req.body.timestamp = Date.now();

  // Continue to JSON Server router
  next();
});
/* end of post('/api/*') */

/* end of CUSTOM-use() */

// #REVIEWS: orders of `use()`?
// You must apply the middlewares in the following order
server.use(rules);

// You must apply the auth middleware before the router
server.use(auth);

server.use(router);
/**
 * #NOTE: custom router
 * BUT unable to use with auth?
 */
// server.use('/api', router);

server.listen(port, () => {
  console.log('JSON Server Listening on:' + port);
});
