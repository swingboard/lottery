const Sequelize = require('sequelize');
module.exports = {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bet365_id: {
        type: Sequelize.STRING
    },
    category_name: {
        type: Sequelize.STRING
    },
    bet365_pd: {
        type: Sequelize.STRING
    },
    father_category: {
        type: Sequelize.STRING
    }
};