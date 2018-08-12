const Sequelize = require('sequelize');
module.exports = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    bet365_id: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    },
    bet365_pd: {
        type: Sequelize.STRING
    }
};