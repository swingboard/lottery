const Sequelize = require('sequelize');

const sequelize = new Sequelize('mysql://root:hello1234@127.0.0.1:3306/lottery');

const Game = sequelize.define('games', require('../models/game'));
const Odds = sequelize.define('odds', require('../models/odds'));

module.exports = {
    sequelize,
    Game,
    Odds
};