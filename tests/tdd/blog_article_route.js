module.exports = function (sinon) {

    function requireBlog(models) {
        return require('../../routes/blog.js')({Article: articlesMock});
    }

    function callBlogArticleRoute(id) {
        blog.article({params: {id: id}}, response);
    }

    // Object to mock the articles model
    var articlesMock;

    //Mock for the promise returned by articles for index
    var promiseMock;

    // Object to mock the response
    var response;

    // Blog module
    var blog;

    describe('Blog Index route', function () {

        beforeEach(function () {

            response = {};
            promiseMock = {};
            articlesMock = {};

            articlesMock.find = sinon.stub()
                .returns(promiseMock);

            promiseMock.then = sinon.spy();

            response.render = sinon.stub();
            response.send = sinon.stub();

            blog = requireBlog({article: articlesMock});
        });

        it('calls article.find', function () {
            callBlogArticleRoute(1);
            articlesMock.find.should.have.been.calledOnce;
        });

        it('calls article.find with the correct id', function () {
            callBlogArticleRoute(1);
            articlesMock.find.should.have.been.calledWith(1);
        });

        it('passes a resolve function to the promise returned by find', function () {
            callBlogArticleRoute(1);

            var args = promiseMock.then.getCall(0).args;

            args[0].should.be.a.function;
        });

        it('passes a reject function to the promise returned by find', function () {
            callBlogArticleRoute(1);

            var args = promiseMock.then.getCall(0).args;

            args[1].should.be.a.function;
        });

        it('calls the response.render function if an article is found', function () {
            callBlogArticleRoute(1);
            promiseMock.then.getCall(0).args[0]({});
            response.render.should.have.been.calledOnce;
        });

        it('calls the response.render function and requests the blog_article template', function () {
            callBlogArticleRoute(1);
            promiseMock.then.getCall(0).args[0]({});
            response.render.getCall(0).args[0].should.equal('blog_article');
        });

        it('passes the article returned by article.find to the render function as the article property', function () {
            var article = {}
            callBlogArticleRoute(1);
            promiseMock.then.getCall(0).args[0](article);
            response.render.getCall(0).args[1].should.have.property('article', article);
        });

        it('responds with a 404 if the article is not found', function () {
            callBlogArticleRoute(1);
            promiseMock.then.getCall(0).args[0](null);
            response.send.should.have.been.calledWith(404);
        });

        it('responds with a 500 if there is an error', function () {
            callBlogArticleRoute(1);
            promiseMock.then.getCall(0).args[1]({message: "There was an error"});
            response.send.should.have.been.calledWith(500);
        });
    });
}
