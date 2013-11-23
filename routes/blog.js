module.exports = function (models) {
    'use strict';
    return {
        /**
         * Blog Index
         * @param req
         * @param res
         */
        index: function(req, res) {
            models.Article.articlesForIndex()
                .then(function (articles) {
                    res.render('blog_index', {articles: articles});
                },
                function (err) {
                    console.error(err.message, err);
                    res.send(500);
                });

        }
    }
};
