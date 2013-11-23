module.exports = function (sequelize) {
    'use strict';

    return {
        Article: require('./article')(sequelize)
    };
};