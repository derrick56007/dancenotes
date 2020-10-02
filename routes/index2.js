var data = require('../data.json');
/*
 * GET home page.
 */

exports.view = function(req, res){
  var x = data['users']['dummy'];
  x['explore'] = data['explore'];

  res.render('index2', x);
};
