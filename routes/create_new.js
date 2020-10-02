const fs = require('fs');
const path = require('path');
var data = require('../data.json');
var mkdirp = require('mkdirp');
const { getAudioDurationInSeconds } = require('get-audio-duration');
var mp3Duration = require('mp3-duration');

exports.view = function (req, res) {
    const author = req.params.author;
    const dance_name = req.body.dn_name;

    var dances = data['users'][author]['dances'];

    var count = 1;

    var dn = dance_name;
    while (dn in dances) {
        dn = dance_name + count.toString();
        count++;
    }

    const parent_dir = './database/' + author + '/audio/';
    // const file = parent_dir + req.file.originalname;
    var file = parent_dir + req.file.originalname + '.mp3';

    // if (req.file.originalname.contains('.mp3') || req.file.originalname.contains('.wav')) {
    //     file = parent_dir + req.file.originalname;
    // } else {
    //     file = parent_dir + req.file.originalname + '.mp3';
    // }

    // const ext = path.extname(req.file.originalname).toLowerCase();
    //
    // if (ext !== '.mp3' && ext !== '.wav' && ext !== '.ogg' && ext !== '.wav' && ext !== '.flac') {
    //     return res
    //         .status(500)
    //         .contentType("text/plain")
    //         .end("Wrong file type!\n name: " + req.file.originalname + "\n ext: " + ext);
    // }

    mkdirp(parent_dir, function (err) {
        if (err) return console.error(err);
        else console.log('Done!');


        fs.rename(req.file.path, file, err => {
            if (err) {
                return res
                    .status(500)
                    .contentType("text/plain")
                    .end("Error");
            } else {

                mp3Duration(file, function (err, duration) {
                    if (err) return console.log(err.message);
                    console.log('Your file is ' + duration + ' seconds long');

                    var mins = Math.floor(duration / 60);
                    var seconds = Math.floor(duration % 60);
                    var d = mins.toString() + ":" + seconds.toString();

                    var dance = {
                        "author": author,
                        "name": dn,
                        "duration": d,
                        "duration-s": Math.floor(duration),
                        "song": file.substring(1),
                        "thumbnail": "https://picsum.photos/170?random",
                        "cues": []
                    };

                    data['users'][author]['dances'][dn] = dance;

                    // save

                    var content = JSON.stringify(data);

                    fs.writeFile('data.json', content, 'utf8', function (err) {
                        if (err) {
                            return console.log(err);
                        }

                        console.log("The file was saved!");

                        res.writeHead(301, { Location: "/create/" + author + "/" + dn });
                        res.end();
                    });

                });

                // getAudioDurationInSeconds(file).then((duration) => {
                //     var mins = Math.floor(duration / 60);
                //     var seconds = Math.floor(duration % 60);
                //     var d = mins.toString() + ":" + seconds.toString();
                //
                //     var dance = {
                //         "author": author,
                //         "name": dn,
                //         "duration": d,
                //         "song": file.substring(1),
                //         "thumbnail": "https://picsum.photos/170?random",
                //         "cues": []
                //     };
                //
                //     data['users'][author]['dances'][dn] = dance;
                //
                //     // save
                //
                //     var content = JSON.stringify(data);
                //
                //     fs.writeFile('data.json', content, 'utf8', function (err) {
                //         if (err) {
                //             return console.log(err);
                //         }
                //
                //         console.log("The file was saved!");
                //
                //         res.writeHead(301, { Location: "/create/" + author + "/" + dn });
                //         res.end();
                //     });
                //
                //
                // }).catch(console.error);
            }
        });
    });
};