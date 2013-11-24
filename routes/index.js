module.exports = function(app, models) {
    'use strict';

    var marked = require('marked');

    app.locals.fromMarkdown = function (text) {
        return marked(text);
    };

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
