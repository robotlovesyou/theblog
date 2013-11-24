var Q = require('q')

module.exports = function(models) {
    return {
        docs: [
            {
                title: 'I am the *title* of an article',
                summary: 'I am the **summary** of an article',
                body: 'I am the body of an article\n```\nvar myVar = 0;\n```'
            },
            {
                title: 'I am also the title of an article',
                summary: 'I am also the body of an article',
                body: 'I am also the body of an article'
            }
        ],

        records: [],

        create: function () {
            var self = this;
            return Q.all(self.docs.map(function (doc) {
                return models.Article.create(doc);
            }))
                .then(function(records) {
                    self.records = records;
                    return Q();
                });
        }

    }
};
