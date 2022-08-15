const Sequelize = require('sequelize');
const db = require('./db');

const Subject = db.define('subject', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Subject;
