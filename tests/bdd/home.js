module.exports = function (sequelize, models, browser) {

    'use strict';

    // Blog Index Suite
    describe('Home', function () {

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
         * I would like to see a robotlovesyou image on the homepage,
         * so I know where I am.
         */
        it('should have a robotlovesyou image', function (done) {
            browser.elementByCssSelector('img.robotlovesyou')
                .should.eventually.exist.notify(done);
        });

        /**
         * As an Owner,
         * I would like Visitors to see some explanatory text on the homepage,
         * so that they understand why the site looks a bit pants at the moment.
         */
        it('should have a container for the explanatory text', function (done) {
            browser.elementByCssSelector('div.explainatory-text')
                .should.eventually.exist.notify(done);
        });
    });
}


