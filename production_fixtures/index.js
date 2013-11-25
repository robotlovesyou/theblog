var Q = require('q');
var path = require('path');
var fs = require('fs');

var readFile = Q.denodeify(fs.readFile);

module.exports = function(models) {

    var blogEntries = [
        {
            title: "Blogging the Development of My Blog on the Blog I am Developing, While I Develop it. (Pretentious? Moi?)",
            summary: "1_summary.md",
            body: "1_body.md"
        }
    ]

    function loadEntry(entry) {
        return Q.all([
            readFile(path.join(__dirname, entry.summary)),
            readFile(path.join(__dirname, entry.body))
        ])
            .spread(function (summary, body) {
                return Q({
                    title: entry.title,
                    summary: summary.toString(),
                    body: body.toString()
                });
            });
    }

    function createBlogArticleFixtures() {
        return Q.all(blogEntries.map(function (entry) {
            return loadEntry(entry)
                .then(function(loadedEntry) {
                    return models.Article.create(loadedEntry);
                })
        }));
    }

    return {
        create: function () {

            //Not returning the promise here, just fire and forget.
            createBlogArticleFixtures()
                .catch(function (err) {
                    console.error('Error Creating Blog Article Fixtures');
                    console.error(err.message, err);
                });
        }
    };
};



