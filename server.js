const jsonServer = require('json-server');
const auth = require('json-server-auth');

const clone = require('clone');
// const data = require('./data/sample.json');
const data = require('./data/db.json');

const port = process.env.PORT || 3000;

const server = jsonServer.create();
const router = jsonServer.router(clone(data), { _isFake: true });
const middlewares = jsonServer.defaults({
  logger: process.env.NODE_ENV !== 'production',
});
/* end of definition */

const rules = auth.rewriter({
  // Permission rules
  // users: 600,
  users: 640,
  posts: 664, 

  // Other rules
  // '/posts/:category': '/posts?category=:category',
});

/**
 * #STEP-1:
 * /!\ Bind the router db to the app server
 */
server.db = router.db;

/**
 * #STEP-2:
 * Set default middlewares (logger, static, cors and no-cache)
 */
server.use(middlewares);

server.use(rules);

// You must apply the auth middleware before the router
server.use(auth);

server.use((req, res, next) => {
  if (req.path === '/') return next();
  router.db.setState(clone(data));
  next();
});

// Use default router
// server.use(router);
server.use('/api', router);

server.listen(port, () => {
  console.log('JSON Server Listening on:' + port);
});
