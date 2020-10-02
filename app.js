/**
 * Module dependencies.
 */
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require("fs");
const handlebars = require('express3-handlebars');
const index = require('./routes/index');
const index2 = require('./routes/index2');
const login = require('./routes/login');
const dance = require('./routes/dance');
const create = require('./routes/create');
const create_new = require('./routes/create_new');
// Example route
// var user = require('./routes/user');

const app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('IxD secret key'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

// Example route


const multer = require("multer");

const handleError = (err, res) => {
    res
        .status(500)
        .contentType("text/plain")
        .end("Oops! Something went wrong!");
};

const upload = multer({
    dest: "./uploads/"
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

const bodyParser = require("body-parser");

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

var ms = require('mediaserver');

const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.eot': 'appliaction/vnd.ms-fontobject',
    '.ttf': 'aplication/font-sfnt'
};

app.get(
    "/database/:author/:ftype/:fl",
    (req, res) => {
        const author = req.params.author;
        const ftype = req.params.ftype;
        const fl = req.params.fl;

        var filePath = "./database/" + author + "/" + ftype + "/" + fl;

        console.log('downloading ' + filePath);

        const ext = path.extname(fl);


        console.log('downloading ' + ftype + "/" + ext.substring(1));

        var file = fs.readFileSync(filePath);
        // res.writeHead(200, {'Content-Type': ftype + "/" + ext.substring(1)});
        // res.end(file, 'binary');
        // new
        ms.pipe(req,res,filePath);
    }
);

function saveCue(author, name, cue_name, file_name, fromT, toT, type) {
    var data = require('./data.json');

    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    cue_name = replaceAll(cue_name, ' ', '-');

    var cue = {
        "cue_name": cue_name,
        "start": fromT,
        "end": toT,
        "file": file_name.substring(1),
        "type": type,
        "audio": type === 'audio'
    };

    data['users'][author]['dances'][name]['cues'].push(cue);

    var content = JSON.stringify(data);

    fs.writeFile('data.json', content, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("New cue saved");
    });
}

var mkdirp = require('mkdirp');

app.post(
    "/upload_text/:author/:name/:fromT/:toT",
    (req, res) => {
        const author = req.params.author;
        const name = req.params.name;
        const cue_name = req.body.cue_name;
        const text_area = req.body.text_area;
        const fromT = req.params.fromT;
        const toT = req.params.toT;

        const parent_dir = './database/' + author + '/text/';

        mkdirp(parent_dir, function (err) {
            if (err) return console.error(err);
            else console.log('Done!');


            console.log("The file was saved!");

            saveCue(author, name, cue_name, text_area, fromT, toT, 'text');
            res
                .status(200)
                .contentType("text/plain")
                .redirect('back');
            // const file = parent_dir + cue_name + '.txt';
            //
            // fs.writeFile(file, text_area, function (err) {
            //     if (err) {
            //         return console.log(err);
            //     }
            //
            //     console.log("The file was saved!");
            //
            //     saveCue(author, name, cue_name, text_area, fromT, toT, 'text');
            //
            //     res
            //         .status(200)
            //         .contentType("text/plain")
            //         .redirect('back');
            // });
        });
    }
);

app.post(
    "/upload_picture/:author/:name/:fromT/:toT",
    upload.single("file" /* name attribute of <file> element in your form */),
    (req, res) => {
        const author = req.params.author;

        const parent_dir = './database/' + author + '/image/';
        const ext = path.extname(req.file.originalname);

        if (!(ext === '.jpg' || ext === '.png' || ext === '.jpeg')) {
            return res
                .status(500)
                .contentType("text/plain")
                .end("Wrong file type! (use png and jpg)");
        }

        mkdirp(parent_dir, function (err) {
            if (err) return console.error(err);
            else console.log('Done!');

            const file = parent_dir + req.file.originalname;

            const name = req.params.name;
            const cue_name = req.body.cue_name;


            fs.rename(req.file.path, file, err => {
                if (err) return handleError(err, res);
                const fromT = req.params.fromT;
                const toT = req.params.toT;
                saveCue(author, name, cue_name, file, fromT, toT, 'image');

                res
                    .status(200)
                    .contentType("text/plain")
                    .redirect('back');
            });
        });

    }
);

app.post(
    "/upload_audio/:author/:name/:fromT/:toT",
    upload.single("file" /* name attribute of <file> element in your form */),
    (req, res) => {
        const author = req.params.author;

        const parent_dir = './database/' + author + '/audio/';

        const ext = path.extname(req.file.originalname);

        if (!(ext === '.mp3')) {
            return res
                .status(500)
                .contentType("text/plain")
                .end("Wrong file type! (use mp3)");
        }

        mkdirp(parent_dir, function (err) {
            if (err) return console.error(err);
            else console.log('Done!');

            const file = parent_dir + req.file.originalname;
            const name = req.params.name;
            const cue_name = req.body.cue_name;

            fs.rename(req.file.path, file, err => {
                if (err) return handleError(err, res);
                const fromT = req.params.fromT;
                const toT = req.params.toT;
                saveCue(author, name, cue_name, file, fromT, toT, 'audio');

                res
                    .status(200)
                    .contentType("text/plain")
                    .redirect('back');
            });
        });
    }
);


app.post(
    "/create/:author/:update_cue/:author2/:name/:cue_name/:fromT/:toT",
    (req, res) => {
        var data = require('./data.json');
        const author = req.params.author;
        const name = req.params.name;
        const cue_name = req.params.cue_name;
        const fromT = req.params.fromT;
        const toT = req.params.toT;

        var cues = data['users'][author]['dances'][name]['cues'];

        var index = -1;
        var cue;
        for (var i = 0; i < cues.length; i++) {
            if (cues[i]['cue_name'] === cue_name) {
                cue = cues[i];
                index = i;
                break;
            }
        }

        if (index < 0) {
            console.log("ERROR");
            return;
        }

        cue['start'] = fromT;
        cue['end'] = toT;

        cues[index] = cue;

        data['users'][author]['dances'][name]['cues'] = cues;

        var content = JSON.stringify(data);

        fs.writeFile('data.json', content, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("Cue updated " + cue_name);

        });
    }
);

app.post(
    "/create/:author/:delete_cue/:author2/:name/:cue_name",
    (req, res) => {
        var data = require('./data.json');
        const author = req.params.author;
        const name = req.params.name;
        const cue_name = req.params.cue_name;

        var cues = data['users'][author]['dances'][name]['cues'];

        var index = -1;
        var cue;
        for (var i = 0; i < cues.length; i++) {
            if (cues[i]['cue_name'] === cue_name) {
                cue = cues[i];
                index = i;
                break;
            }
        }

        if (index < 0) {
            console.log("ERROR");
            return;
        }

        cues.splice(index, 1);

        data['users'][author]['dances'][name]['cues'] = cues;

        var content = JSON.stringify(data);

        fs.writeFile('data.json', content, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }

            res
                .status(200)
                .contentType("text/plain")
                .redirect('back');

            console.log("Cue deleted " + cue_name);
        });
    }
);

app.post(
    "/create/:author/:delete_note/:author2/:name",
    (req, res) => {
        var data = require('./data.json');
        const author = req.params.author;
        const name = req.params.name;

        delete data['users'][author]['dances'][name];

        console.log(data['users'][author]['dances']);

        var content = JSON.stringify(data);

        fs.writeFile('data.json', content, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }

            res
                .status(200)
                .contentType("text/plain")
                .redirect('back');

            console.log("Note deleted " + name);
        });
    }
);

app.get('/', login.view);
var urlencodedParser = bodyParser.urlencoded({extended: false});
app.get('/login', urlencodedParser, login.login);
app.get('/register', urlencodedParser, login.register);
// app.get('/index', index.view);
app.get('/index', index2.view);
app.get('/dance/:author/:name', dance.view);
app.get('/create/:author/:name', create.view);
app.post('/create_new/:author',
    upload.single("file" /* name attribute of <file> element in your form */),
    create_new.view);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
