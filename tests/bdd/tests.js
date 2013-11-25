'use strict';

// Use mocha as promised to run the behavior tests
//require("mocha-as-promised")();

//Set node env to test
process.env.NODE_ENV = 'test';

// Instantiate the app module to start the web server
require('../../app');

// Use chai and chai as promised for my assertions
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var Q = require('q');
var sequelize = require('../../db').sequelize;
var models = require('../../models')(sequelize);

// Use the wd library for webdriver
var wd = require('wd');

// Link chai-as-promised and wd promise chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

//browser driver
var browser = wd.promiseChainRemote();

describe('Behaviour Tests', function () {
    // Mocha's 2 second timeout is sometimes a little slow when
    // webdriver is starting up
    this.timeout(6000);

    before(function (done) {
        //Open a browser using webdriver remote
        browser.init({browserName:'firefox'})
            .then(function () {
                done();
            });
    });

    require('./blog_index.js')(sequelize, models, browser);
    require('./blog_article.js')(sequelize, models, browser);
    require('./navigation.js')(sequelize, models, browser);
    require('./home.js')(sequelize, models, browser);
    require('./contact.js')(sequelize, models, browser);

    after(function (done) {
        //Quit the browser
        browser.quit()
            .then(function () {
                done();
            });
    });
})