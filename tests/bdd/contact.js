module.exports = function (sequelize, models, browser) {

    'use strict';

    // Blog Index Suite
    describe('Contact', function () {

        beforeEach(function (done) {
            browser.get('http://localhost:3000/contact')
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
         * I would like to see a navigation menu on the Contact Details page,
         * so that I can navigate to other areas of the web site.
         */
        it('should have a robotlovesyou image', function (done) {
            browser.elementByCssSelector('div.navigation')
                .should.eventually.exist.notify(done);
        });

        /**
         * As a Visitor,
         * I would like to see contact details for Andy on the Contact Details page,
         * so that I can shower him with praise and hire him at a generous day rate.
         */
        it('should have an email address for andy', function (done) {
            browser.elementByCssSelector('a.email').getAttribute('href')
                .should.eventually.equal('mailto:andy@robotlovesyou.com').notify(done);
        });

        it('should have a twitter handle for andy', function (done) {
            browser.elementByCssSelector('a.twitter').getAttribute('href')
                .should.eventually.equal('https://twitter.com/ridiculousGnome').notify(done);
        });
    });
}


