/**
 * Created by andy on 20/11/2013.
 */

//Initialize Sequelize
var Sequelize = require('sequelize');
var path = require('path');

var dbUser = '', dbPassword = '', dbName = '', dbOptions = {dialect: 'sqlite'};

if('test' === process.env.NODE_ENV) {
    dbOptions.storage = path.join(__dirname, 'test.db');
} else {
    //Default DB settings, for development
}

exports.sequelize = new Sequelize(dbUser, dbPassword, dbName, dbOptions);
