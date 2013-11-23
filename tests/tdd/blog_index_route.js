module.exports = function (sinon) {

    function requireBlog(models) {
        return require('../../routes/blog.js')({Article: articlesMock});
    }

    function callBlogIndexRoute() {
        blog.index({}, response);
    }

    // Object to mock the articles model
    var articlesMock;

    //Mock for the promise returned by articles for index
    var promiseMock;

    // Object to mock the response
    var response;

    // Blog route
    var blog

    describe('Blog Index route', function () {

        beforeEach(function () {

            response = {};
            promiseMock = {};
            articlesMock = {};

            articlesMock.articlesForIndex = sinon.stub()
                .returns(promiseMock);

            promiseMock.then = sinon.spy();

            response.render = sinon.stub();
            response.send = sinon.stub();

            blog = requireBlog({article: articlesMock});
        });

        it('Calls article.articlesForIndex', function () {

            callBlogIndexRoute();

            articlesMock.articlesForIndex.should.have.been.calledOnce;
        });

        it('Passes resolve and reject functions to articlesForIndex', function () {

            callBlogIndexRoute();

            var args = promiseMock.then.getCall(0).args;

            // Should be called with two arguments
            args.length.should.equal(2);

            // Both arguments should be functions
            args[0].should.be.a.function;
            args[1].should.be.a.function;
        });

        it('Calls the render function', function () {

            callBlogIndexRoute();

            // Call the promise resolve function
            promiseMock.then.getCall(0).args[0]({});

            response.render.should.have.been.calledOnce;
        });

        it('Calls the render function with the correct template name', function () {

            callBlogIndexRoute();

            // Call the promise resolve function
            promiseMock.then.getCall(0).args[0]({});

            response.render.getCall(0).args.length.should.be.above(0);
            response.render.getCall(0).args[0].should.equal('blog_index');
        });

        it('Passes the articles to the render function', function () {
            var articles = {};

            callBlogIndexRoute();

            // Call the promise resolve function
            promiseMock.then.getCall(0).args[0](articles);

            var args = response.render.getCall(0).args
            args.length.should.be.above(1);
            args[1].should.be.an.object;
            args[1].should.have.property('articles');
            args[1].articles.should.equal(articles);
        });

        it('Sends a 500 status on error', function () {

            callBlogIndexRoute();

            // Call the promise reject function
            promiseMock.then.getCall(0).args[1]({message: "There was an error"});

            response.send.should.have.been.calledOnce;
            response.send.should.have.been.calledWith(500);
        });
    });
}
