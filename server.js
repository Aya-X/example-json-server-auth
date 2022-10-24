const formidable = require('formidable');
const path = require('path');
const fs = require('fs');

const jsonServer = require('json-server');
const auth = require('json-server-auth');

const jwt_decode = require('jwt-decode');
const JWT_SECRET_KEY =
  require('./node_modules/json-server-auth/dist/constants').JWT_SECRET_KEY;

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

// /!\ Bind the router db to the app server
server.db = router.db;

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
  if (req.url === '/upload/img') {
    const form = new formidable.IncomingForm();

    if (!fs.existsSync('.\\public\\upload\\')) {
      fs.mkdirSync('.\\public\\upload');
    }

    form.uploadDir = '.\\public\\upload\\';
    form.parse(req, function (err, fields, files) {
      if (err) throw err;

      if (files != null) {
        const { filepath, originalFilename } = files.upload;
        let returnPath = `/upload/${originalFilename}`;
        let newPath = `public\\upload\\${originalFilename}`;

        fs.rename(filepath, newPath, function (err) {
          if (err) {
            res.end('error');
            throw Error('false');
          } else {
            res.json({ url: returnPath });
          }
        });
      } else res.end('error');
    });
    return;
  }

  if (req.method === 'POST') {
    const token = req.header('Authorization')
      ? req.header('Authorization').replace('Bearer ', '')
      : null;

    if (token) {
      const decoded = jwt_decode(token);
      console.log({ token, JWT_SECRET_KEY, decoded });
      const intSub = Number(decoded.sub);
      req.body.userId = intSub;
    }
    /* end of IF-token */
  }

  // Continue to JSON Server router
  next();
});
/* end of custom */

server.use(rules);

// You must apply the auth middleware before the router
server.use(auth);

// Use default router
server.use('/api', router);

server.listen(port, () => {
  console.log('JSON Server Listening on:' + port);
});
