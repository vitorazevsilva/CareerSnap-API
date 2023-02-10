const express = require('express');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');

const secret = 'careersnap';

module.exports = (app) => {
  
  const router = express.Router();

  router.post('/signin', (req, res, next) => {
    if (!req.body.email) throw res.status(400).json({message:'Email is a mandatory attribute'})
    if (!req.body.password) throw res.status(400).json({message:'Password is a mandatory attribute'})
    app.services.user.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) throw res.status(403).json({message: 'Incorrect Credentials'})
        if (bcrypt.compareSync(req.body.password, user.password)) {
          const payload = {
            id: user.id
          };
          const jwtToken = jwt.encode(payload, secret);
          res.status(200).json({ message: 'Correct Credentials', token:jwtToken }); 
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

  router.post('/recovery', async (req, res, next) => {
    try {
      if (!req.body.email) throw res.status(400).json({message:'Email is a mandatory attribute'})
      await app.services.user.genRecovery(req.body.email)
      res.status(201).json({message: 'If this email is registered in our system, you will receive an email to proceed with the recovery'})
    } catch (err) {
      return next(err);
    }
  });

  router.put('/recovery', async (req, res, next) => {
    try {
      const result = await app.services.user.proceedRecovery(req.body);
      if (result.message) throw res.status(400).json({ message: result.message})
      if (result.message2) throw res.status(403).json({ message: result.message2})
      return res.status(200).json({message: 'Password Replaced Successfully'});
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
