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
        },

        /**
         * Blog Article
         * @param req
         * @param res
         */
        article: function (req, res) {
            models.Article.find(req.params.id)
                .then(function (record) {
                    if(null === record) {
                        res.send(404);
                        return;
                    }
                    res.render('blog_article', {article: record});
                },
                function (err) {
                    console.error(err.message, err);
                    res.send(500);
                }
            );
        }
    }
};
