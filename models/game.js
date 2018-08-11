const Sequelize = require('sequelize');
module.exports = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    host_team: {
        type: Sequelize.STRING
    },
    guest_team: {
        type: Sequelize.STRING
    },

    begin_time: {
        type: Sequelize.DATE
    },

    analyse_url: {
        type: Sequelize.STRING
    },

    created_time: {
        type: Sequelize.DATE
    },
    bet365_id: {
        type: Sequelize.INTEGER
    }
};