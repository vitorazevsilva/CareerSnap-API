const express = require('express');
const bcrypt = require('bcrypt-nodejs');

module.exports = (app) => {
    const router = express.Router();

    router.get('/', async (req, res, next) => {
      try {
        const skill = await app.services.skill.findAll(req.body)
        res.status(200).json({ message: 'Skills Read Successfully', content: skill });
      } catch (err) {
        return next(err);
      }
    });

    router.post('/', async (req, res, next) => {
        try {
            const result = await app.services.skill.save(req.user.id,req.body);
            if (result.message) throw res.status(400).json({ message: result.message})
            return res.status(201).json({message: 'Created Skill Successfully', content: result });
        } catch (err) {
            return next(err);
        }
    })

    router.get('/:id', async (req, res, next) => {
        try {
            if(isNaN(req.params.id) || req.params.id.length > 9 ) throw res.status(400).json({message: 'Invalid ID'})
            await app.services.skill.findOne({id:req.params.id})
            .then((skill) => {
                if (!skill) throw res.status(400).json({message: 'Incorrect ID'})
                res.status(200).json({ message: 'Skill Read Successfully', content: skill });
            })
        } catch (err) {
        return next(err);
        }
    });

    router.put('/:id', async (req, res, next) => {
        try {
            const skill = await app.services.skill.update(req.user.id,req.params.id,req.body)
            if ("message" in skill) throw res.status(400).json({ message: skill.message})
            res.status(200).json({ message: 'Skill Updated Successfully', content: skill[0] });
        } catch (err) {
        return next(err);
        }
    });

    router.delete('/:id', async (req, res, next) => {
        try {
            const skill = await app.services.skill.remove(req.user.id,req.params.id)
            if ("message" in skill) throw res.status(400).json({ message: skill.message})
            res.status(200).json({ message: 'Skill Deleted Successfully'});
        } catch (err) {
        return next(err);
        }
    });

    return router;
}