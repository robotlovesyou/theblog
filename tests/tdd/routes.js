var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);
chai.should();

//Blog Index Route Tests
describe('Route tests', function () {
    require('./blog_index_route')(sinon);
});
