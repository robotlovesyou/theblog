module.exports = function (sequelize, models, browser) {

    'use strict';

    var hostRegExpPattern = '^http://[^/]+'

    // Blog Index Suite
    describe('Blog Index', function () {

        beforeEach(function (done) {
            browser.get('http://localhost:3000/')
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
         * I would like to see a navigation menu on the home page,
         * so that I can navigate to other areas of the web site.
         */
        it('should have a naviation div', function (done) {
            browser.elementByCssSelector('.navigation')
                .should.eventually.exist.notify(done);
        });

        it('should have a link to the home page', function (done) {
            browser.elementByCssSelector('a.home').getAttribute('href')
                .should.eventually.match(new RegExp(hostRegExpPattern + '/$')).notify(done);
        });

        it('should have a link to the blog', function (done) {
            browser.elementByCssSelector('a.blog').getAttribute('href')
                .should.eventually.match(new RegExp(hostRegExpPattern + '/blog/$')).notify(done);
        });

        it('should have a link to the contact page', function (done) {
            browser.elementByCssSelector('a.contact').getAttribute('href')
                .should.eventually.match(new RegExp(hostRegExpPattern + '/contact$')).notify(done);
        });
    });
}


