const express = require('express');
const bcrypt = require('bcrypt-nodejs');

module.exports = (app) => {
    const router = express.Router();

    router.post('/search', async(req, res, next) => {
        try {
            const experience = await app.services.experience.findAll(req.body)
            res.status(200).json({ message: 'Experiences Read Successfully', content: experience });
        } catch (err) {
            return next(err);
        }
    });

    router.post('/', async(req, res, next) => {
        try {
            const result = await app.services.experience.save(req.user.id, req.body);
            if (result.message) throw res.status(400).json({ message: result.message })
            return res.status(201).json({ message: 'Created Experience Successfully', content: result });
        } catch (err) {
            return next(err);
        }
    })

    router.get('/:id', async(req, res, next) => {
        try {
            if (isNaN(req.params.id) || req.params.id.length > 9) throw res.status(400).json({ message: 'Invalid ID' })
            await app.services.experience.findOne({ id: req.params.id })
                .then((experience) => {
                    if (!experience) throw res.status(400).json({ message: 'Incorrect ID' })
                    res.status(200).json({ message: 'Experience Read Successfully', content: experience });
                })
        } catch (err) {
            return next(err);
        }
    });

    router.put('/:id', async(req, res, next) => {
        try {
            const experience = await app.services.experience.update(req.user.id, req.params.id, req.body)
            if ("message" in experience) throw res.status(400).json({ message: experience.message })
            res.status(200).json({ message: 'Experience Updated Successfully', content: experience[0] });
        } catch (err) {
            return next(err);
        }
    });

    router.delete('/:id', async(req, res, next) => {
        try {
            const experience = await app.services.experience.remove(req.user.id, req.params.id)
            if ("message" in experience) throw res.status(400).json({ message: experience.message })
            res.status(200).json({ message: 'Experience Deleted Successfully' });
        } catch (err) {
            return next(err);
        }
    });

    return router;
}