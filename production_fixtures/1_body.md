## BDD/TDD development from scratch with node.js/express ##

### Summary

Clearly, the world is in dire need of another blogging engine, right? OK, perhaps not so much but *I* am very much in need of a website where I can show off my best work and a blog where I can share my ~~opinionated rants~~ thoughts on all things programming. 

One thing I would have found very useful when I first started working with node/express is a guide to behaviour and test driven development on the platform. While there is an embarassment of riches when it comes to testing modules it has taken me a few attempts to gather a set of tools which I feel gel nicely together and allow me to put together expressive and readable tests.

In this first post I'm going to cover the modules and patterns I use to develop node using a 'behaviour test - unit test - code' cycle. In future posts I hope to cover subjects such as Authentication, Third Party Integration and Front End UI development, probably using Ember.js 

### User Stories ###

So, first things first: like all good little agile software engineers I am going to start with a set of user stories. You'll notice this is a pretty minimal set, and doesn't even include the ability to add or edit posts because to keep this first article a remotely digestible length I am planning on cheating a little bit to add the first one or two.

0. **Blog - Index**

 > As a Visitor, I would like to see titles and summaries of the last few blog posts on the blog index, so that I can see which scintillating nuggets Andy has gifted to the World.

0. **Blog - Index Link to Article**
 > As a Visitor, I would like the title of the Article summary to be a link to the Article page, so that I can read the Article.
 
0. **Blog - Article**

 > As a Visitor, I would like to see the Title and Text of an Article when I visit the relevant page, so that I can read the Article.
 
0. **Blog - Article Comments Alternative**

 > As an Owner, I would like to place a notice at the end of Articles explaining that comments are not yet implemented and requesting that feedback is emailed, so that Visitors can provide feedback on Articles.
 
0. **Blog - Formatting**

 > As an Owner, I would like the Summary and Body of my Articles to be formatted using Github Flavoured Markdown, so that my Articles are not a big old mess.

0. **Blog Index - Navigation**

 > As a Visitor, I would like to see a navigation menu on the blog index page, so that I can navigate to other areas of the web site.

0. **Blog Article - Navigation**

 > As a Visitor, I would like to see a navigation menu on a blog Article page, so that I can navigate to other areas of the web site.

I'm not going to cover the development of every single one of these stories but I will try to go over all the important techniqies in addition to making the full source of each release [available on github](https://github.com/robotlovesyou/robotlovesyou-dot-com/releases) available.

<a name="GettingStarted"></a>
### Getting Started ###

Before I can write any code there are a few tools I will need. I'm starting out with a working build environment (XCode Command Line Tools) and a Java runtime installed. Additionally I will need.

* Selenium Server
* Node.js
* Express

#### Selenium Server
Selenium Server allows me to run full stack automated integration tests in any browser with a [webdriver](http://www.seleniumhq.org/projects/webdriver/) implementation available. It can be downloaded from http://www.seleniumhq.org/download/ and run from the command line using...

```bash
# cd to directory containing the selenium server jar file

java -jar selenium-server-standalone-x.x.x.jar

# where x.x.x is the relevant version of selenium.
```

#### Node.js
For node installation I use the [nvm command line tool](https://github.com/creationix/nvm) because it allows me to manage multiple node versions on in my development environment

Once it is installed following the instructions in the readme of the Github repo linked above, new node versions can be installed with...

```bash
nvm install x.x.x

# Where x.x.x is the required version of node.js
```

I am developing this blog against 0.10.21, which is the latest stable release at the time of writing. I can install it and make it the default version of node with...

```bash
nvm install 0.10.21
nvm alias default 0.10.21
```

#### Express
I'll install express globally to give me access to the command line tool

```bash
npm install -g express
```

Express can create a scaffold to get me started. It's not quite what I want but it's close enough.

```bash
# -s adds session support. I'm not decided at this stage whether I will be using it but it's easy to take out

express -s theblog
cd theblog
npm install express jade --save

# I could get away with npm install as instructed but this form pins the jade and express modules at their current version in the package.json
```

I now have a working node.js/express application which I can start with
```bash
node app.js
```
If I now point my browser at http://localhost:3000 I'll get a web page with a welcome message...
___

**Express**

Welcome to express

___

### BDD: Blog Index Route

Before I can start writing behaviour tests I will have to install the modules which are going to enable them. They are:

* Mocha

 A BDD/TDD Testing framework written by [TJ Holowaychuck](http://tjholowaychuk.com/), the person behind express and jade.

* Chai

 An assertion library which allows the use of more expressive language than the built in node.js assertion module
 
* WD

 A Selenium webdriver implementation for node.js. WD is perhaps not as well documented as some other webdriver libraries but it has a really nice promise/chaining syntax which works really well with the final two libraries...
 
* Chai as promised

 Enables chai to handle promises, so instead of writing code like...
 
```javascript
it('displays some behaviour', function (done) {
  browser.doesSomethingReturningAPromise()
    .then(function (result) {
      return browser.doesAnotherThingReturningAPromise();
    })
    .then(function (anotherResult) {
      anotherResult.should.be(someValue);
        done();
    })
    .fail(function (error){
      done(error);
    });
});
```
 
 I can write code like...
 
```javascript
it('displays some behaviour using mocha-as-promised and chai-as-promised', function (done) {
  return browser.doesSomethingReturningAPromise()
    .doesAnotherThingReturningAPromise()
    .should.become(someValue).notify(done);
});
```
 
 Which I think is far more readable.
 
To install these libraries as development dependencies I use npm again

```bash
npm install mocha chai wd chai-as-promised --save-dev

# The --save-dev option adds these modules into my package.json file as development dependencies
```

Now to start coding the behaviour tests. 

First I'll create a directory to hold the tests, and create my first test script

```bash
mkdir -p tests/bdd ;cd tests/bdd
touch blog_index.js
```

I'll add the following to blog_index.js to prepare it for testing the blog index user stories

```javascript
'use strict';

// Instantiate the app module to start the web server
require('../../app');

// Use chai and chai as promised for my assertions
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

// Use the wd library for webdriver
var wd = require('wd');

// Link chai-as-promised and wd promise chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

//browser driver
var browser = wd.promiseChainRemote();

// Blog Index Suite
describe('Blog Index', function () {

  // Mocha's 2 second timeout is sometimes a little slow when
  // webdriver is starting up
  this.timeout(6000);

  before(function (done) {
      //Open a browser using webdriver remote
      browser.init({browserName:'firefox'})
          .then(function () {
              done();
          });
  });

  beforeEach(function (done) {
          browser.get('http://localhost:3000/blog/')
          .then(function () {
              done();
          });
  });

  after(function (done) {
      //Quit the browser
      browser.quit()
          .then(function () {
              done();
          });
  });
});

```

The boilerplate above gives me all I need to run my node app and open a browser to start performing behaviour tests against it.

I'll start adding the first behaviour test. Immediately following the after(...) call and within the describe callback I'll add
```javascript
/**
* As a Visitor, 
* I would like to see summaries of the last few blog posts on the blog index, 
* so that I can see which scintillating nuggets Andy has gifted to the World.
*/
it('displays a number of article summaries on the blog index', function (done) {
  browser.elementsByCssSelector('.article-summary')
    .should.eventually.have.length.above(0).notify(done);
});
```

Next, after ensuring that the selenium server is running as detailed in [Getting Started](#GettingStarted) I can run my first behaviour test with:

```bash
mocha blog_index.js
```

Which gives me some output like...

```bash
Express server listening on port 3000
․

  0 passing (2s)
  1 failing

  1) Blog Index displays a number of article summaries on the blog index:
     AssertionError: expected [] to have a length above 0 but got 0
```

**Woohoo!** my first failing behaviour test.

### TDD: Blog Index Route

Following the best practices of testing my software from the outside in, and testing the code I wish had, now that I have a failing test my next job is to make it pass, but to make it pass I need a Route (and a model but I'll get on to that) and, because I am using test driven development, before I can code my route I need to code tests for it.

The first step I'm going to take is to carry out a little refactoring. I'm going to use [Dependency Injection](http://en.wikipedia.org/wiki/Dependency_injection) to make it easier to test my Route functions by injecting stubs and spys for the model code I wish I had, so I need to make a few changes to the way the routes are coded and required into the app.

```bash
# From the project root.
cd routes
rm user.js
touch blog.js
```

Replace index.js with:
```javascript
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
```

In blog.js add:
```javascript
module.exports = function (models) {
    'use strict';
    return {
        /**
         * Blog Index
         * @param req
         * @param res
         */
        index: function(req, res) {

        }
    }
};
```

Back to the application root
```bash
cd ..
```

And in app.js change:
```javascript
var routes = require('./routes');
var user = require('./routes/user');
```

to:
```javascript
var routes = require('./routes')({});
var blog = routes.blog;
```

And change:
```javascript
app.get('/', routes.index);
app.get('/users', user.list);
```

to:
```javascript
app.get('/', routes.index);
app.get('/blog', blog.index);
```

Structuring my code this way will allow me to inject stubs for my models into the tests for the routes.

To help with mocks, stubs and spies I'm going to add two new development libraries

* Sinon.JS

 [Sinon.JS](http://sinonjs.org/) is a mocking/stubbing/spying library for javascript.

* sinon-chai

 [sinon-chai](https://github.com/domenic/sinon-chai) integrates chai's assertions with sinon, allowing syntax like:
 ```javascript
 spy.should.have.been.calledOnce
 ```

I'll install these two libraries as development dependencies with:

```bash
# From the project root
npm install sinon sinon-chai --save-dev
```

I'm also going to make a home for my specs, and create a script for the blog index route tests

```bash
# From the project root
mkdir -p tests/tdd ; cd tests/tdd
touch blog_index_route.js
```

Now I'm ready to start adding tests for my blog index route. I'm going to wish for an article model at my data layer and to help keep logic out of my routes I'm going to wish for a static method on that model which returns all the articles which belong on the blog index. 

```javascript
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);
chai.should();

// Object to mock the articles model
var articlesMock = {};


var blog = require('../../routes/blog.js')({Article: articlesMock});

describe('Blog Index route', function () {

    it('calls Article.articlesForIndex', function () {
        articlesMock.articlesForIndex = sinon.spy();

        blog.index({}, {});

        articlesMock.articlesForIndex.should.have.been.calledOnce;
    });
});
```

Run this test with:
```bash
mocha blog_index_route.js
```

And I should get some output like:

```bash
․

  0 passing (8ms)

  1 failing

  1) Blog Index route calls article.articlesForIndex:
     AssertionError: expected spy to have been called exactly once, but it was called 0 times
```

So, now that I have a failing test, the next step is to make it pass. In routes/blog.js I'll update the index function to:

```javascript
index: function(req, res) {
  models.Article.articlesForIndex();
}
```

Run the tdd tests again and hey presto, a passing test!

Of course that call isn't going to do a lot on its own. Node is an asynchronous environment. I prefern working with promises where available, and sequelize supports returning them from most asycnhronous methods. I'll add a new test to make sure I'm calling the **then** method of the promise returned from my articlesForIndex method, and do a little bit of refactoring at the same time.

```javascript
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);
chai.should();

describe('Blog Index route', function () {
    
    // Object to mock the articles model
    var articlesMock;

    //Mock for the promise returned by articles for index
    var promiseMock;

    // Object to mock the response
    var response;

    // Blog route
    var blog

    function requireBlog(models) {
        return require('../../routes/blog.js')(models);
    }

    function callBlogIndexRoute() {
        blog.index({}, response);
    }

    beforeEach(function () {
        response = {};
        promiseMock = {};
        articlesMock = {};

        articlesMock.articlesForIndex = sinon.stub()
            .returns(promiseMock);

        promiseMock.then = sinon.spy();

        blog = requireBlog({Article: articlesMock});
    });

    it('calls Article.articlesForIndex', function () {

        callBlogIndexRoute();

        articlesMock.articlesForIndex.should.have.been.calledOnce;
    });

    it('passes resolve and reject functions to articlesForIndex', function () {

        callBlogIndexRoute();

        var args = promiseMock.then.getCall(0).args;

        // Should be called with two arguments
        args.length.should.equal(2);

        // Both arguments should be functions
        args[0].should.be.a.function;
        args[1].should.be.a.function;
    });
});
```

I'm back to a failing test so I'll update the blog index route function again to add that callback in:

```javascript
index: function(req, res) {
    models.Article.articlesForIndex()
        .then(function (articles) {
            
        },
        function (err) {
            
        });

}
```

Run the tests again and **hurrah!** Two passing tests. Great stuff but I'm still not returning anything from the route. I'll address that now. 
Another round of refactoring to keep the tests DRY, add in a test for a call to render and I have:
```javascript
// Snip - Variable and function declarations removed for brevity

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

        blog = requireBlog({Article: articlesMock});
    });

    //Snip - Existing tests removed for brevity

    it('Calls the render function', function () {

        callBlogIndexRoute();

        // Call the promise resolve function
        promiseMock.then.getCall(0).args[0]({});

        response.render.should.have.been.calledOnce;
    });
});
```

... and I'm back to a failing test so I'll make a further modification to the route function to get it passing again:

```javascript
index: function(req, res) {
    models.Article.articlesForIndex()
        .then(function (articles) {
          res.render();
        },
        function (err) {

        });
}
```

To round out the tests for the blog index route I'm going to add some checks that the render function is being called with the correct parameters and add a test for the 'sad path' where an error is returned from articlesForIndex. Note that while coding these I still stick to the "Write one failing test and then write just enough code to make it pass" cycle:

```javascript
// Directly below the test for the call to response.render...

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
```

And to make all my new tests pass, the final version of the index function:
```javascript
index: function(req, res) {
    models.Article.articlesForIndex()
        .then(function (articles) {
            res.render('blog_index', {articles: articles});
        },
        function (err) {
            res.send(500);
        });

}
```

### TDD: Article Model

Continuing with the method of coding my application from the outside in, the next step is to develop a model with the API I wished for in my route. I'm going to use [sequelize](http://sequelizejs.com/documentation) for this. – I know, a relational database, how *quaint* – I've used [mongoose](http://mongoosejs.com/) and [mongodb](http://www.mongodb.org/) for all my previous node projects and much as I like how well mongo documents map to object graphs – well, I suppose they *are* object graphs – I also really miss joins. I recently worked on a project using [django](https://www.djangoproject.com/) and it was a real breath of fresh air being able to simply tell the RDBMS which data I wanted and let *it* worry about how. 
Sequelize appears to have all the features I want and is nicely documented so I figure I'll give it a twirl.

I'll add sequelize as a dependency and create a new test script for this model. I'm going to use an in memory sqlite database for my tests. At the same time I want to tidy my tests up a little. I'm happy having separate files for behaviour tests and unit tests but I want to run all my unit tests from the same place

I'm also adding the q module to assist with working with promises later on:

```bash
# From the project root
npm install sequelize sqlite3, q --save
cd tests/tdd
touch tests.js
touch routes.js
touch models.js
touch article_model.js
```



From tests.js, i'll simply require my route and model tests

```javascript
//Run all route tests
require('./routes');

//Run all model tests
require('./models');
```

And in routes.js I'll do some initialization before including my route test files (of which there is only one right now);

```javascript
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);
chai.should();

//Blog Index Route Tests
describe('Route tests', function () {
    require('./blog_index_route')(sinon);
});
```

My blog index tests now need to be exported as a function:
```javascript
module.exports = function (sinon) {

    //Snip - Existing Blog index route test code.
}
```
Similarly in models.js I'm going to set up chai-as-promised and sequelize and create a new in-memory database before requiring my model tests

```javascript
'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

// Initialize Chai/Chai as promised
chai.use(chaiAsPromised);
chai.should();

var Sequelize = require('sequelize');
var sequelize;
var models;

// Cache the sequelize logging output till after all the tests have run
var logOutput = '\n';
function log(msg) {
    logOutput += msg + '\n';
}

sequelize = new Sequelize('','','',{
    dialect: 'sqlite',
    logging: log
});

// Load model definitions
models = require('../../models')(sequelize);

// Run model tests
describe('Model tests', function () {

    // Recreate the database after each test to ensure isolation
    beforeEach(function (done) {
        sequelize.sync({force: true})
            .success(function () {
                done();
            });
    });

    //After all the tests have run, output all the sequelize logging.
    after(function () {
        console.log(logOutput);
    });

    require('./article_model')(sequelize, models);
});
```

And then I'll place the scaffold for the article model tests in article_model.js

```javascript
module.exports = function (sequelize, models) {
    'use strict';

    var Article;
    describe('Article Model', function () {

    });
};
```

This will drop and recreate all my tables before each test, ensuring there is no pollution from one to the next. As it stands though, if I add any model tests they will crash because I've not yet defined my models module.

```bash
# From the project root
mkdir models
cd models
touch index.js
touch article.js
```

models/index.js
```javascript
module.exports = function (sequelize) {
    'use strict';

    return {
        Article: require('./article')(sequelize)
    };
};
```

and models/article.js
```javascript
module.exports = function (sequelize) {
    var Sequelize = require('sequelize');

    'use strict';
    var Article = sequelize.define('Article', {});
    return Article;
};
```

The first thing I want to do is make sure I can create an article. I know from my user stories that they will have a title, summary and body so...

tests/tdd/article_model.js:

```javascript
it('should create a model with valid properties', function (done) {
    models.Article.create({title: 'thing', summary: 'thing', body: 'thing'})
        .should.not.be.rejected.notify(done);
});
```

If I  now run my test suite with
```bash
mocha tests
```

I'll get something similar to:
```bash
  ․․․․․․․
Executing: DROP TABLE IF EXISTS `Articles`;
Executing: CREATE TABLE IF NOT EXISTS `Articles` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
Executing: INSERT INTO `Articles` (`id`,`createdAt`,`updatedAt`,`title`,`summary`,`body`) VALUES (NULL,'2013-11-16 18:28:56','2013-11-16 18:28:56','thing','thing','thing');



  6 passing (28ms)
  1 failing

  1) Model tests Article Model Validation should create a model with valid properties:
     AssertionError: expected promise not to be rejected but it was rejected with [Error: SQLITE_ERROR: table Articles has no column named title]
```

The sql logging can be very useful if something is going wrong but if it is distracting it can be turned off by changing the logging option of the Sequelize constructor to false.

```javascript
sequelize = new Sequelize('','','',{
    dialect: 'sqlite',
    logging: false
});
```

To get that test passing I'll add the required fields to my article model in models/article.js:

```javascript
module.exports = function (sequelize) {
    'use strict';

    var Sequelize = require('sequelize');

    var Article = sequelize.define('Article', {
        title: Sequelize.TEXT,
        summary: Sequelize.TEXT,
        body: Sequelize.TEXT
    });
    return Article;
};
```

Next I'm going to add some validation, which arguably doesn't belong to the current beahaviour, but I want to include them in this blog article so I'm shoehorning them in here anyway! Remembering to proceed one test at a time I'll add the following tests to my article_model.js tests file:

```javascript
it('should not be valid without a title', function (done) {
    models.Article.create({summary: 'thing', body: 'thing'})
        .should.be.rejected.notify(done);
});

it('should not be valid without a summary', function (done) {
    models.Article.create({title: 'thing', body: 'thing'})
        .should.be.rejected.notify(done);
});

it('should not be valid without a body', function (done) {
    models.Article.create({title: 'thing', summary: 'thing'})
        .should.be.rejected.notify(done);
});
```

And make each one pass in turn by adding the changing the code in models/article.js to:
```javascript
var Article = sequelize.define('Article', {
    title: {
        type: Sequelize.TEXT,
        validate: {
            notNull: true,
            notEmpty: true
        }
    },
    summary: {
        type: Sequelize.TEXT,
        validate: {
            notNull: true,
            notEmpty: true
        }
    },
    body: {
        type: Sequelize.TEXT,
        validate: {
            notNull: true,
            notEmpty: true
        }
    }
});
return Article;
```

Next I'm going to add the articlesForIndex method I wished for in my route.
This is going to return some data from the database so I'll refactor the test file a little and add some fixtures. After that my article test file looks a little like: (some code removed for brevity)

```javascript
module.exports = function (sequelize, models) {
    'use strict';

    var Q = require('q');
    var should = require('chai').should();

    describe('Article Model', function () {

        describe('Validation', function () {
            // Snip - Validation tests removed for brevity
        });

        describe('articlesForIndex', function () {

            function addArticleFixture(offsetSeconds) {
                return models.Article.create({
                    title: 'Fixture Article',
                    summary: 'This is the summary of an article from a fixture',
                    body: 'This is the body of an article from a fixture',
                    createdAt: new Date(new Date().getTime() - (offsetSeconds * 1000))
                });
            }

            beforeEach(function (done) {
                // Add some articles to the database
                Q.all([
                    addArticleFixture(40),
                    addArticleFixture(30),
                    addArticleFixture(20),
                    addArticleFixture(10)
                ])
                    .then(function () {
                        done();
                    });
            });

            it('should define a function "articlesForIndex"', function () {
                should.exist(models.Article.articlesForIndex);
            });
        });
    });
};
```

You can see I've added a test in there to make sure the articlesForIndex method exists. I can make that pass my updating the articles model as follows:

```javascript
module.exports = function (sequelize) {
    'use strict';

    var Sequelize = require('sequelize');

    /**
     * Article Model
     * @type {*}
     */
    var Article = sequelize.define('Article', {
        title: {
            type: Sequelize.TEXT,
            validate: {
                notNull: true,
                notEmpty: true
            }
        },
        summary: {
            type: Sequelize.TEXT,
            validate: {
                notNull: true,
                notEmpty: true
            }
        },
        body: {
            type: Sequelize.TEXT,
            validate: {
                notNull: true,
                notEmpty: true
            }
        }
    }, {
        classMethods: {
            articlesForIndex: function () {

            }
        }
    });
    return Article;
};
```

To test that the method is returning the four article fixtures I'll add this to the article model tests

```javascript
it('returns all the articles from the database', function (done) {
    models.Article.articlesForIndex()
        .should.eventually.have.length(4).notify(done);
});
```

And to make that test pass I'll update the articles for index method to:
```javascript
classMethods: {
    articlesForIndex: function () {
        return this.findAll();
    }
}
```

Of course my index won't make much sense if the articles aren't in a meaningful order so I'll add a rather ugly, but I think at least idomatic test for that too:

```javascript
it('should return all the article models in created order', function (done) {
    models.Article.articlesForIndex()
        .then(function (articles) {
            var t = new Date().getTime();
            return Q(articles.every(function (a) {
                if(t >= a.createdAt.getTime()) {
                    t = a.createdAt.getTime();
                    return true;
                }
                return false;
            }));
        }).should.eventually.be.true.notify(done);
});
```

And to make that test pass I'll update the articlesForIndex method one last time:
```javascript
articlesForIndex: function () {
    return this.findAll({order: 'createdAt DESC'});
}
```
### Wrapping Up

OK, I have a passing test for my blog index route, and a passing test for my model so now I can go back and get my bahaviour test passing.

The first thing I want to do is to create a module to manage my database connection, so that I can access it from my tests as well as my application but keep things dry.

```bash
# From the application root
mkdir db
cd db
touch index.js
```

And in db/index.js
```javascript
'use strict';

//Initialize Sequelize
var Sequelize = require('sequelize');
var path = require('path');

var dbUser = '', dbPassword = '', dbName = '', dbOptions = {dialect: 'sqlite'};

if('test' === process.env.NODE_ENV) {
    dbOptions.storage = path.join(__dirname, 'test.db');
} else {
    //Default DB settings, for development
}

exports.sequelize = new Sequelize(dbUser, dbPassword, dbName, dbOptions);
```

Next, I want to add that module into my application and start injecting my models into my route module, so replace the top of app.js with:

```javascript
//Initialize Sequelize
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();

//Initialize sequelize
var sequelize = require('./db').sequelize;

//Load models
var models = require('./models')(sequelize);

//Sync the models to the database
sequelize.sync();

//Load routes
var routes = require('./routes')(models);

var blog = routes.blog;
```

I'll need a couple of Article fixtures so that there is something for the test to display. After including the new db module and adding in the fixtures my tests/bdd/blog_index.js file looks like

```javascript
'use strict';

// Use mocha as promised to run the behavior tests
//require("mocha-as-promised")();

//Set node env to test
process.env.NODE_ENV = 'test';

// Instantiate the app module to start the web server
require('../../app');

// Use chai and chai as promised for my assertions
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var Q = require('q');
var sequelize = require('../../db').sequelize;
var models = require('../../models')(sequelize);
sequelize.sync({force: true});

// Use the wd library for webdriver
var wd = require('wd');

// Link chai-as-promised and wd promise chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;


var articleFixtureDocs = [
    {
        title: 'I am the title of an article',
        summary: 'I am the summary of an article',
        body: 'I am the body of an article'
    },
    {
        title: 'I am also the title of an article',
        summary: 'I am also the body of an article',
        body: 'I am also the body of an article'
    }
]

function createArticleFixtures() {
    return Q.all(articleFixtureDocs.map(function (doc) {
        return models.Article.create(doc);
    }));
}

//browser driver
var browser = wd.promiseChainRemote();

// Blog Index Suite
describe('Blog Index', function () {

    // Mocha's 2 second timeout is sometimes a little slow when
    // webdriver is starting up
    this.timeout(6000);

    before(function (done) {
        //Open a browser using webdriver remote
        browser.init({browserName:'firefox'})
            .then(function () {
                done();
            });
    });

    beforeEach(function (done) {
        createArticleFixtures()
            .then(function () {
                return browser.get('http://localhost:3000/blog/');
            })
            .then(function () {
                done();
            });

    });

    after(function (done) {
        //Quit the browser
        browser.quit()
            .then(function () {
                done();
            });
    });
    
    /**
    * As a Visitor, I would like to see summaries of the last few blog posts on the blog index, so
    * that I can see which scintillating nuggets Andy has gifted to the World.
    */
    it('displays a number of article summaries on the blog index', function (done) {
      return browser.elementsByCssSelector('.article-summary')
        .should.eventually.have.length.above(0).notify(done);
    });
});
```

To get my bahavior test passing I'll need one more component: a jade template for the index.

```bash
# From the project root
cd views
touch blog_index.jade
```

And in views/blog_index.jade
```jade
extends layout
block content
    each article in articles
        h3.title = article.title
        div.article-summary = article.summary
```

If I now run the behavior tests I now get some output like:
```bash
# Snip Express/Sequelize logging
․

  1 passing (4s)
```

/Happydance A passing behaviour!

Now, clearly there is a lot still to do. My behaviour tests could do with some filling out, there's the rest of the behaviours to test and code and almost certainly further refactoring to do but what I have now is a method and a set of tools for Behaviour Driven Development and Test Driven Development with node/express. Really, the rest of the development of the blog is a case of repeatedly applying the existing techniques to the rest of the user stories.

I will put a number of releases of this version into the github repository: a working copy of the source code as it stands; a working copy with all of the stories from this blog implemented and finally my full web site with stories for a home page, contact page and the hack I mentioned to work around the current lack of an editing page implemented. I'll also add a little styling to the final version.

Well done for getting to the end. I hope this post has been useful to you.