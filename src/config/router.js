const express = require('express');

module.exports = (app) => {
  app.use('/auth', app.routes.auths);

  const secureRouter = express.Router();

  secureRouter.use('/user', app.routes.users);
  secureRouter.use('/skill', app.routes.skills)

  app.use('/v1', app.config.passport.authenticate(), secureRouter);
};
