module.exports = function (sequelize) {
    'use strict'

    var Sequelize = require('sequelize');

    /**
     * Article Model
     * @type {*}
     */
    var Article = sequelize.define('Article', {
        title: {
            type: Sequelize.TEXT,
            validate: {
                notNull: true,
                notEmpty: true
            }
        },
        summary: {
            type: Sequelize.TEXT,
            validate: {
                notNull: true,
                notEmpty: true
            }
        },
        body: {
            type: Sequelize.TEXT,
            validate: {
                notNull: true,
                notEmpty: true
            }
        }
    }, {
        classMethods: {
            articlesForIndex: function () {
                return this.findAll({order: 'createdAt DESC'});
            }
        }
    });
    return Article;
};