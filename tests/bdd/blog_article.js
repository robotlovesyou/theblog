var Q = require('q');
var marked = require('marked');

module.exports = function (sequelize, models, browser) {

    'use strict';

    var articleFixtures = require('./article_fixtures')(models);

    // Blog Index Suite
    describe('Blog Article', function () {

        beforeEach(function (done) {
            sequelize.sync({force: true})
                .then(function () {
                    return articleFixtures.create();
                })
                .then(function () {
                    return browser.get('http://localhost:3000/blog/' + articleFixtures.records[0].id);
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
         * I would like to see the Title and Text of an Article when I visit the relevant page,
         * so that I can read the Article.
         */
        it('has a title', function (done) {
            browser.elementByCssSelector('h1.title')
                .should.eventually.exist.notify(done);
        });

        it('shows the text of the title', function (done) {
            browser.elementByCssSelector('h1.title').getAttribute('innerHTML')
                .should.eventually.match(new RegExp(marked(articleFixtures.docs[0].title))).notify(done);
        });

        it('has a body', function (done) {
            browser.elementByCssSelector('.article-body')
                .should.eventually.exist.notify(done);
        });

        it('shows the text of the body', function (done) {
            browser.elementByCssSelector('.article-body').getAttribute('innerHTML')
                .should.eventually.match(new RegExp(marked(articleFixtures.docs[0].body))).notify(done);
        });

        /**
         * As an Owner,
         * I would like to place a notice at the end of Articles explaining that comments are not yet implemented
         * and requesting that feedback is emailed,
         * so that Visitors can provide feedback on Articles.
         */
        it('has a comments notice', function (done) {
            browser.elementByCssSelector('.comments-explaination')
                .should.eventually.exist.notify(done);
        });

        it('explains the lack of comments', function (done) {
            browser.elementByCssSelector('.comments-explaination').text()
                .should.eventually
                .match(/Comments are not yet implemented. Please email feedback to me at andy@robotlovesyou.com/)
                .notify(done);
        });

        it('provides a link to the email address andy@robotlovesyou.com', function (done) {
            browser.elementByCssSelector('.comments-explaination a').getAttribute('href')
                .should.eventually.equal('mailto:andy@robotlovesyou.com').notify(done);
        });


        /**
         * As an Owner,
         * I would like the Summary and Body of my Articles to be formatted using Github Flavoured Markdown,
         * so that my Articles are not a big old mess.
         */
        it('uses an em tag for text formatted: *some text*', function (done) {
            browser.elementByCssSelector('h1.title em')
                .should.eventually.exist.notify(done);
        });

        it('uses a pre tag for fenced code blocks', function (done) {
            browser.elementByCssSelector('.article-body pre')
                .should.eventually.exist.notify(done);
        });

        /**
         * As a Visitor,
         * I would like to see a navigation menu on a blog Article page,
         * so that I can navigate to other areas of the web site.
         */
        it('has a nvigation div', function (done) {
            browser.elementByCssSelector('div.navigation')
                .should.eventually.exist.notify(done);
        });
        //Further navigation tests have been factored out into their own suite in ./navigation.js

    });
}


