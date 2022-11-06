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
  bookmarks: 664,

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

server.post('/api/postLikes', (req, res, next) => {
  console.log('POST!');

  const subUserId = decodeJWTsID({ req });
  const reqPostId = req?.body?.postId || '';

  const { db } = req.app;
  const post = db.get('posts').find({ id: reqPostId }).value();
  // console.log('postData:::', post);

  if (!post?.likesBy) {
    db.get('posts').find({ id: reqPostId }).assign({ likesBy: [] }).write();
  }

  const postLikes = post.likesBy.map(({ userId }) => {
    // console.log(userId);
    return userId;
  });

  const hasLiked = postLikes.includes(subUserId);
  if (hasLiked) {
    // return res
    //   .status(400)
    //   .jsonp({ message: '已按過讚', success: false, status: 400 });

    db.get('posts')
      .find({ id: reqPostId })
      .get('likesBy')
      .find({ userId: subUserId })
      .unset('userId')
      .write();
    db.get('posts').find({ id: reqPostId }).get('likesBy').remove({}).write();

    db.get('users')
      .find({ id: subUserId })
      .get('likePosts')
      .find({ postId: reqPostId })
      .unset('postId')
      .write();
    db.get('users').find({ id: subUserId }).get('likePosts').remove({}).write();

    // console.log(
    //   db
    //     .get('users')
    //     .find({ id: subUserId })
    //     .get('likePosts')
    //     .find({ postId: reqPostId })
    //     .value()
    // );
  }

  if (!hasLiked) {
    post.likesBy.push({ userId: subUserId });

    const user = db.get('users').find({ id: subUserId }).value();
    console.log(user);

    if (!user?.likePosts) {
      db.get('users').find({ id: subUserId }).assign({ likePosts: [] }).write();
    }
    user.likePosts.push({ postId: reqPostId });
  }

  // Continue to JSON Server router
  next();
});
/* end of post('/api/postLikes') */

server.post('/api/bookmarks', (req, res, next) => {
  console.log(`[${req.method}]_${req.url}`);

  const subUserId = decodeJWTsID({ req }) || null;
  const reqPostId = req?.body?.postId || '';

  const { db } = req.app;
  // Assuming the following returns an array of your object
  const bookmarks = db.get('bookmarks').value();

  const hasBookmarkedIdx = db
    .get('bookmarks')
    .findIndex({ userId: subUserId, postId: reqPostId })
    .value();
  console.log('hasBookmarkedIdx:::', hasBookmarkedIdx);

  if (hasBookmarkedIdx !== -1) {
    /**
     * IF-exist, THEN remove it
     */
    const bookmarkId = bookmarks[hasBookmarkedIdx].id;
    console.log('bookmarkId:::', bookmarkId);

    const targetBookmark = db.get('bookmarks').find({ id: bookmarkId }).value();
    db.get('bookmarks').pull(targetBookmark).write();

    // db.get('bookmarks').find({ id: bookmarkId }).remove({}).write();
    // db.get('bookmarks').remove(targetBookmark).write();
    // db.get('bookmarks').remove({}).write();

    console.log('targetBookmark:::', targetBookmark);

    return res
      .status(201)
      .jsonp({ message: '已取消收藏', success: true, status: 201 });
  }
  /* end of IF-exist */

  // req.body.createdAt = Date.now();

  // Continue to JSON Server router
  next();
});
/* end of post('/api/bookmarks') */

/* end of CUSTOM-use() */

// #REVIEWS: orders of `use()`?
server.use(rules);

// You must apply the auth middleware before the router
server.use(auth);

// Use custom router
server.use('/api', router);

server.listen(port, () => {
  console.log('JSON Server Listening on:' + port);
});
