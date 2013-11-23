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
sequelize.sync({force: true});

// Use the wd library for webdriver
var wd = require('wd');

// Link chai-as-promised and wd promise chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;


var articleFixtureDocs = [
    {
        title: 'I am the title of an article',
        summary: 'I am the summary of an article',
        body: 'I am the body of an article'
    },
    {
        title: 'I am also the title of an article',
        summary: 'I am also the body of an article',
        body: 'I am also the body of an article'
    }
]

function createArticleFixtures() {
    return Q.all(articleFixtureDocs.map(function (doc) {
        return models.Article.create(doc);
    }));
}

//browser driver
var browser = wd.promiseChainRemote();

// Blog Index Suite
describe('Blog Index', function () {

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

    beforeEach(function (done) {
        createArticleFixtures()
            .then(function () {
                return browser.get('http://localhost:3000/blog/');
            })
            .then(function () {
                done();
            });

    });

    after(function (done) {
        //Quit the browser
        browser.quit()
            .then(function () {
                done();
            });
    });
    
    /**
    * As a Visitor, I would like to see summaries of the last few blog posts on the blog index, so
    * that I can see which scintillating nuggets Andy has gifted to the World.
    */
    it('displays a number of article summaries on the blog index', function (done) {
    	return browser.elementsByCssSelector('.article-summary')
        .should.eventually.have.length.above(0).notify(done);
    });
});
