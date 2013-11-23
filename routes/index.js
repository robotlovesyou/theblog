module.exports = function(models) {
    'use strict';

    return {
        /**
         * Home Page Route
         * @param req
         * @param res
         */
        index: function(req, res){
            res.render('index', { title: 'Express' });
        },

        /**
         * include routes for blog
         */
        blog: require('./blog')(models)
    };
};
