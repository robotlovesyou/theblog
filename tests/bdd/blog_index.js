var Q = require('q');
var marked = require('marked');

module.exports = function (sequelize, models, browser) {

    'use strict';

    var hostRegExpPattern = '^http://[^/]+'

    var articleFixtures = require('./article_fixtures')(models);

    // Blog Index Suite
    describe('Blog Index', function () {

        beforeEach(function (done) {
            sequelize.sync({force: true})
                .then(function () {
                    return articleFixtures.create();
                })
                .then(function () {
                    return browser.get('http://localhost:3000/blog/');
                })
                .then(function () {
                    done();
                },
                function (err) {
                    done(error);
                }
            );

        });

        /**
         * As a Visitor,
         * I would like to see summaries and titles of the last few blog posts on the blog index,
         * so that I can see which scintillating nuggets Andy has gifted to the World.
         */
        it('displays a number of article titles on the blog index', function (done) {
            browser.elementsByCssSelector('.title')
                .should.eventually.have.length.above(0).notify(done);
        });

        it('displays the text of an expected title on the blog index', function (done) {
            browser.elementByCssSelector('body').getAttribute('innerHTML')
                .should.eventually.match(new RegExp(marked(articleFixtures.docs[0].title))).notify(done);
        })

        it('displays a number of article summaries on the blog index', function (done) {
            browser.elementsByCssSelector('.article-summary')
                .should.eventually.have.length.above(0).notify(done);
        });

        it('displays the text of an expected summary on the blog index', function (done) {
            browser.elementByCssSelector('body').getAttribute('innerHTML')
                .should.eventually.match(new RegExp(marked(articleFixtures.docs[0].summary))).notify(done);
        });

        /**
         * As a Visitor,
         * I would like the title of the Article summary to be a link to the Article page,
         * so that I can read the Article.
         */
        it('has an anchor tag inside the article title', function (done) {
            browser.elementsByCssSelector('.title a')
                .should.eventually.have.length.above(0).notify(done);
        });

        it('should have the correct href in the title anchor', function (done) {
            browser.elementByCssSelector('.title a').getAttribute('href')
                .should.eventually.match(new RegExp(hostRegExpPattern + '/blog/' + articleFixtures.records[0].id + '$')).notify(done);
        });

        /**
         * As a Visitor,
         * I would like to see a navigation menu on the blog index page,
         * so that I can navigate to other areas of the web site.
         */
        it('should have a naviation div', function (done) {
            browser.elementByCssSelector('.navigation')
                .should.eventually.exist.notify(done);
        });

        //Further navigation tests have been factored out into their own suite in ./navigation.js

        /**
         * As a Visitor,
         * I would like to see a read more link under each blog summary,
         * so that I can navigate to the blog entry
         */
        it('has a read more link under the article summary', function (done) {
            browser.elementsByCssSelector('a.read-more')
                .should.eventually.have.length(articleFixtures.docs.length).notify(done);
        });

    });
}


