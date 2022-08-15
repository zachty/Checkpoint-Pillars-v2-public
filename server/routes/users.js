const router = require('express').Router();
const {
  models: { User },
} = require('../db');
const { Op } = require('sequelize');

/**
 * All of the routes in this are mounted on /api/users
 * For instance:
 *
 * router.get('/hello', () => {...})
 *
 * would be accessible on the browser at http://localhost:3000/api/users/hello
 *
 * These route tests depend on the User Sequelize Model tests. However, it is
 * possible to pass the bulk of these tests after having properly configured
 * the User model's name and userType fields.
 */

// Add your routes here:

router.get('/unassigned', async (req, res, next) => {
  try {
    const data = await User.findUnassignedStudents();
    res.send(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/teachers', async (req, res, next) => {
  try {
    const data = await User.findTeachersAndMentees();
    res.send(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!Number(req.params.id)) res.sendStatus(400);
    else {
      const destroyed = await User.destroy({ where: { id: req.params.id } });
      if (!destroyed) res.sendStatus(404);
      else res.sendStatus(204);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    //feel like there has to be a better way to do this than useing two awaits, but if username exists during create it will throw an error and jump to the catch (could make another hook)
    if (await User.findOne({ where: { name: req.body.name } }))
      res.sendStatus(409);
    else {
      const user = await User.create(req.body);
      res.status(201).send(user);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const updatedUser = await User.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (!updatedUser[0]) res.sendStatus(404);
    else res.send(updatedUser[1][0]);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const data = await User.findAll({
      //where name is like the one searched, case insesnitive
      where: { name: { [Op.iLike]: `%${req.query.name}%` } },
    });
    res.send(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
