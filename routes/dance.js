

exports.view = function(req, res){
    const author = req.params.author;
    const name = req.params.name;

    var data = require('../data.json');

    res.render('play', data['users'][author]['dances'][name]);
};