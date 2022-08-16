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

// /users/unassigned - get a list of students without mentors
router.get('/unassigned', async (req, res, next) => {
  try {
    const data = await User.findUnassignedStudents();
    res.send(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// /users/teacher - get a list of teachers and mentees
router.get('/teachers', async (req, res, next) => {
  try {
    const data = await User.findTeachersAndMentees();
    res.send(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// /user/delete - delete a user
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

// /user/post - create a new user if possible
router.post('/', async (req, res, next) => {
  try {
    //feel like there has to be a better way to do this than useing two awaits, but if username exists during create it will throw an error and jump to the catch (could make another hook)
    if (await User.findOne({ where: { name: req.body.name } })) {
      const err = new Error('User already exists');
      err.status = 409;
      //sent to error handler in app.js
      throw err;
    } else {
      const user = await User.create(req.body);
      res.status(201).send(user);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// /users/id - change a userid
router.put('/:id', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id },
    });
    if (!user) res.sendStatus(404);
    else {
      const updatedUser = await user.update(req.body);
      res.send(updatedUser);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//search query /api/users?name=username
router.get('/', async (req, res, next) => {
  try {
    const data = await User.findAll({
      //where name is like the one searched, case insesnitive
      where: { name: { [Op.iLike]: `%${req.query.name}%` } },
    });
    if (!data.length) res.sendStatus(404);
    else res.send(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:id/peers', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) res.sendStatus(404);
    else {
      const data = await user.getPeers();
      res.send(data);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
