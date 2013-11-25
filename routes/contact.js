module.exports = function(models) {
    'use strict';

    return {
        /**
         * Contact Page Route
         * @param req
         * @param res
         */
        index: function(req, res){
            res.render('contact', { title: 'contact - robotlovesyou.com' });
        }
    };
};
