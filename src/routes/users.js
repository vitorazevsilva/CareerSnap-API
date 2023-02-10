const express = require('express');
const bcrypt = require('bcrypt-nodejs');

module.exports = (app) => {
    const router = express.Router();

    router.get('/', async (req, res, next) => {
      try {
        const user = await app.services.user.findAll({id: req.user.id})
        res.status(200).json({ message: 'Data Read Successfully', content: user[0] });
      } catch (err) {
        return next(err);
      }
    });

    router.put('/', async (req, res, next) => {
      try {
        const user = await app.services.user.update(req.user.id,req.body)
        if ("message" in user) throw res.status(400).json({ message: user.message})
        if ("message2" in user) throw res.status(409).json({ message: user.message2})
        res.status(200).json({ message: 'Data Updated Successfully', content: user[0] });
      } catch (err) {
        return next(err);
      }
    });
    return router;
}