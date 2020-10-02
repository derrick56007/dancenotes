const users = require('../users.json');
const fs = require("fs");
const crypto = require('crypto');

exports.view = function (req, res) {
    res.render('login');
};

exports.login = function (req, res) {
    const username = req.query.username;
    const password = req.query.password;

    if (typeof users[username] !== "undefined") {
        var hashedPassCode = users[username];
        const salt = hashedPassCode.substring(0, saltLength);
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha512');
        const hashString = hash.toString('hex');
        const saltWithHash = salt + hashString;

        if (hashedPassCode === saltWithHash) {
            var data = require('../data.json');

            var x = data['users'][username];
            x['explore'] = data['explore'];

            res.render('index', x);

            console.log("User successfully logged in!")
        } else {
            console.log("Hashed passwords don't match!");
        }


    } else {
        console.log(typeof users[username]);
        console.log(users[username] === password);

        return res
            .status(500)
            .contentType("text/plain")
            .end("Wrong username or password!");
    }
};

var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0,length);   /** return required number of characters */
};

const saltLength = 24;

exports.register = function (req, res) {
    const username = req.query.username;
    const password = req.query.password;
    const rpassword = req.query.rpassword;

    if (typeof users[username] === "undefined") {
        if (password === rpassword) {
            // hash and salt
            const salt = genRandomString(saltLength);
            const hash = crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha512');
            const hashString = hash.toString('hex');
            const saltWithHash = salt + hashString;
            
            users[username] = saltWithHash;
            // console.log("SALT LENGTH: " + salt.length);

            var content = JSON.stringify(users);

            fs.writeFile('users.json', content, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("Account created!");
            });

            var data = require('../data.json');

            data['users'][username] = {
                "name": username,
                "dances": {}
            };

            var content2 = JSON.stringify(data);

            fs.writeFile('data.json', content2, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("Account created part 2!");
            });

        } else {
            return res
                .status(500)
                .contentType("text/plain")
                .end("Passwords don't match!");
        }
    } else {
        return res
            .status(500)
            .contentType("text/plain")
            .end("Username exists!");
    }

    res.render('login');
};