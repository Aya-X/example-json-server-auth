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
  // Permission rules
  // users: 600,
  users: 640,
  posts: 664,

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

/* end of customs */

// #REVIEWS: orders of `use()`?
server.use(rules);

// You must apply the auth middleware before the router
server.use(auth);

// Use custom router
server.use('/api', router);

server.listen(port, () => {
  console.log('JSON Server Listening on:' + port);
});
