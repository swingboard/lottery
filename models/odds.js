const Sequelize = require('sequelize');
module.exports = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    host_odds: {
        type: Sequelize.STRING
    },
    guest_odds: {
        type: Sequelize.STRING
    },
    created_time: {
        type: Sequelize.DATE
    },
    bet365_id: {
        type: Sequelize.INTEGER
    }
}