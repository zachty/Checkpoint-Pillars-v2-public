/* eslint-disable no-unused-vars */
const Sequelize = require('sequelize');
const db = require('./db');

const User = db.define(
  'user',
  {
    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    userType: {
      type: Sequelize.ENUM('STUDENT', 'TEACHER'),
      defaultValue: 'STUDENT',
      allowNull: false,
    },
    isStudent: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.userType === 'STUDENT';
      },
      set(value) {
        return new Error(`Don't set virtual value`);
      },
    },
    isTeacher: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.userType === 'TEACHER';
      },
      set(value) {
        return new Error(`Don't set virtual value`);
      },
    },
  },
  {
    hooks: {
      beforeUpdate: async (user) => {
        //if trying to change a students mentor
        if (user.changed()[0] === 'mentorId') {
          if ((await user.getMentor()).isStudent)
            throw new Error(`Can't set student as mentor`);
        }
        //if trying to change usertype
        if (user.changed()[0] === 'userType') {
          // user.isTeacher is the new value, will cancel update if this fails
          if (user.isTeacher) {
            //if user started as student
            if (user.mentorId)
              //change to user.mentorID - should be null
              throw new Error(
                'Cannot change to teacher while you have a mentor'
              );
          } else {
            //if user started as a teacher
            if ((await user.getMentees()).length)
              throw new Error(
                'Cannot change to student while you have mentees'
              );
          }
        }
      },
    },
  }
);

//MODEL methods
User.findUnassignedStudents = function () {
  return User.findAll({ where: { mentorId: null, userType: 'STUDENT' } });
};

User.findTeachersAndMentees = function () {
  return User.findAll({
    include: {
      model: User,
      as: 'mentees',
    },
    where: { userType: 'TEACHER' },
  });
};

//INSTANCE methods
User.prototype.getPeers = async function () {
  const mentor = await this.getMentor();
  return await mentor.getMentees({
    //get all mentees WHERE mentee.id != user.id
    where: { id: { [Sequelize.Op.ne]: [this.id] } },
  });
};

/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

module.exports = User;
