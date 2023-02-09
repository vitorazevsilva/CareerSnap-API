const express = require('express');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/validationError');

const secret = 'careersnap';

module.exports = (app) => {
  const router = express.Router();

  router.post('/signin', (req, res, next) => {
    app.services.user.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) throw res.status(403).json({message: 'Incorrect Credentials'})
        if (bcrypt.compareSync(req.body.password, user.password)) {
            const payload = {
              id: user.id
            };
            const token = jwt.encode(payload, secret);
            res.status(200).json({ token });
        } else throw res.status(403).json({message: 'Incorrect Credentials'})
      }).catch((err) => next(err));
  });

  router.post('/signup', async (req, res, next) => {
    try {
      const result = await app.services.user.save(req.body);
      if (result.message) throw res.status(400).json({ message: result.message})
      const payload = {
        id: result.id
      };
      const jwtToken = jwt.encode(payload, secret);
      return res.status(201).json({message: 'Successful Created Account', token: jwtToken });
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
