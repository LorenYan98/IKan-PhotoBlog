/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const ObjectId = require('mongodb').ObjectId;
var async = require('async');

var express = require('express');
var app = express();
const fs = require("fs");
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
var processFormBody = multer({ storage: multer.memoryStorage() }).single('uploadedphoto');
app.use(express.static(__dirname));
app.use(session({ secret: "secretKey", resave: false, saveUninitialized: false }));
app.use(bodyParser.json());
// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            { name: 'user', collection: User },
            { name: 'photo', collection: Photo },
            { name: 'schemaInfo', collection: SchemaInfo }
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.login_name || !request.session.user_id) {
        response.status(401).send("not logged in");
        return;
    }
    User.find({}, function (err, users) {
        // Query returned an error.  We pass it back to the browser with an Internal Service
        // Error (500) error code.
        if (err) {
            console.error('Doing /user/list error:', err);
            response.status(500).send(JSON.stringify(err));
        } else if (users.length === 0) {
            response.status(500).send('Missing UserList');
        } else {
            users = JSON.parse(JSON.stringify(users));
            for (let i = 0; i < users.length; i++) {
                delete users[i].location;
                delete users[i].description;
                delete users[i].occupation;
                delete users[i].__v;
                delete users[i].login_name;
                delete users[i].password;
                delete users[i].favorites;
                delete users[i].mentions;
            }
            response.status(200).send(users);
        }
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    var id = request.params.id;
    if (!request.session.login_name || !request.session.user_id) {
        response.status(401).send("not logged in");
        return;
    }
    User.findOne({ _id: id }, function (err, user) {
        if (err) {
            if (user === undefined) {
                console.log('User with _id:' + id + ' not found.');
                response.status(400).send('Not found');
                return;
            } else {
                console.error('Doing /user/:ids error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }

        }
        user = JSON.parse(JSON.stringify(user));
        delete user.__v;
        delete user.login_name;
        delete user.password;
        response.status(200).send(user);
    });
});


/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    let id = request.params.id;
    if (!request.session.login_name || !request.session.user_id) {
        response.status(401).send("not logged in");
        return;
    }
    Photo.find({ user_id: id }, async function (err, photos) {
        if (err) {
            if (photos === undefined) {
                console.log('Photos for user with _id:' + id + ' not found.');
                response.status(400).send('Not found');
                return;
            } else {
                console.error('Doing /photosOfUser/' + id, ' error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
        }
        photos = JSON.parse(JSON.stringify(photos));
        for (let i = 0; i < photos.length; i++) {
            delete photos[i].__v;

            let commentList = photos[i].comments;
            for (let j = 0; j < commentList.length; j++) {

                let userInfo = User.findOne({ _id: photos[i].comments[j].user_id }, (error) => {
                    if (error) {
                        response.status(400).send('Not found');
                    }
                }).clone();

                await userInfo.then((user) => {
                    photos[i].comments[j].user = {
                        _id: photos[i].comments[j].user_id,
                        first_name: user.first_name,
                        last_name: user.last_name
                    };
                });


                delete photos[i].comments[j].user_id;
            }
        }


        response.status(200).send(photos);
    });
});
// get favorite list
app.get("/favorite", function (request, response) {
    if (!request.session.login_name || !request.session.user_id) {
        response.status(401).send("not logged in");
        return;
    }
    let user_id = request.session.user_id;

    User.findOne({ _id: ObjectId(user_id) })
        .then((user) => {
            if (!user) {
                console.log('User with _id:' + user_id + ' not found.');
                response.status(400).send('Not found');
                return;
            } else if (!user.favorites || user.favorites.length === 0) {
                response.status(200).send(user.favorites);
                return;
            }

            let favorite_photoList = [];
            let favorites = user.favorites;

            async.each(favorites, function (photo_id, callback) {
                Photo.findOne({ _id: photo_id }).exec()
                    .then((photo) => {
                        favorite_photoList.push({
                            file_name: photo.file_name,
                            date_time: photo.date_time,
                            _id: photo_id
                        });
                        callback();
                    })
                    .catch((err) => {
                        console.log('Photo with _id:' + photo_id + ' not found.');
                        response.status(400).send(err);
                    });
            }, function (err) {
                if (err) {
                    response.status(400).send('Not able to find all favorites');
                    return;
                }
                response.status(200).send(favorite_photoList);

            });

        }).catch((err) => {
            response.status(400).send(err);
        });
});
// get current login user
app.post("/user/currentUser", function (request, response) {
    if (!request.session.login_name || !request.session.user_id) {
        response.status(401).send("not logged in");
        return;
    }
    let cur_user_id = request.session.user_id;
    User.findOne({ _id: cur_user_id }).exec()
        .then((user) => {
            if (!user) {
                console.log('User with _id:' + cur_user_id + ' not found.');
                response.status(400).send('Not found');
                return;
            }
            response.status(200).send(user);

        }).catch((err) => {
            console.log('User with _id:' + cur_user_id + ' not found.');
            response.status(400).send(err);
        });
});

//add new photo_id to user's favorite list
app.post("/favorite/:photo_id", function (request, response) {
    if (!request.session.login_name || !request.session.user_id) {
        response.status(401).send("not logged in");
        return;
    }
    let cur_user_id = request.session.user_id;
    let photo_id = request.params.photo_id;
    User.findOne({ _id: cur_user_id }).exec()
        .then((user) => {
            if (!user) {
                console.log('User with _id:' + cur_user_id + ' not found.');
                response.status(400).send('Not found');
                return;
            }
            if (!user.favorites.includes(photo_id)) {
                user.favorites.push(photo_id);
                user.save(function (err) {
                    console.log(err);
                });
            }
            response.status(200).send("Favorite added successfully");

        }).catch((err) => {
            console.log('User with _id:' + cur_user_id + ' not found.');
            response.status(400).send(err);
        });

});

// delete photo_id from user's favorite list
app.delete("/favorite/:photo_id", function (request, response) {
    if (!request.session.login_name || !request.session.user_id) {
        response.status(401).send("not logged in");
        return;
    }
    let cur_user_id = request.session.user_id;
    let photo_id = request.params.photo_id;
    User.findOne({ _id: cur_user_id }).exec()
        .then((user) => {
            if (!user) {
                console.log('User with _id:' + cur_user_id + ' not found.');
                response.status(400).send('Not found');
                return;
            }

            const index = user.favorites.indexOf(photo_id);
            user.favorites.splice(index, 1);

            user.save(function (err) {
                console.log(err);
            });
            response.status(200).send("Deleted");


        });
});

app.post("/admin/login", function (request, response) {

    let loginName = request.body.login_name;
    let password = request.body.password;

    User.findOne({ login_name: loginName }).exec()
        .then(user => {
            if (!user) {
                console.log("User with login_user:" + loginName + " not found.");
                response.status(400).send("Login name was not recognized");
                return;
            }

            if (user.password !== password) {
                response.status(400).send("Wrong password");
                return;
            }
            request.session.login_name = loginName;
            request.session.user_id = user._id;
            user = JSON.parse(JSON.stringify(user));
            delete user.login_name;
            delete user.password;
            response.status(200).send(user);
        }).catch(err => {
            console.error('find user with user_id ' + loginName + 'error:', err);
            response.status(500).send(JSON.stringify(err));
        });
    //store into request.session.user_id so that others can read.
});

app.post("/admin/logout", function (request, response) {
    request.session.destroy(function (err) {
        if (err) {
            response.status(400).send(err);
            return;
        }
        response.status(200).send("logout successful");
    });
});

app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    if (!request.session.login_name || !request.session.user_id) {
        response.status(401).send('Not logged in');
    }
    if (!request.body.comment || request.body.comment === 0) {
        response.status(400).send('No comment added');
    }

    let photo_id = request.params.photo_id;
    let cur_user_id = request.session.user_id;
    Photo.findOne({ _id: photo_id }).exec()
        .then(photo => {

            let newComment = { comment: request.body.comment, date_time: new Date(), user_id: cur_user_id };
            photo.comments = photo.comments.concat([newComment]);
            photo.save(function (err) {
                console.log(err);
            });
            response.status(200).send("comment saved");
        }).catch(err => {
            response.status(401).send(JSON.stringify(err));
        });
});
// upload a new photo
app.post("/photos/new", function (request, response) {
    if (!request.session.login_name || !request.session.user_id) {
        response.status(401).send("not logged in");
        return;
    }
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send(err);
            return;
        }
        var timestamp = new Date().valueOf();
        var filename = "U" + String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function (error) {
            // XXX - Once you have the file written into your images directory under the name
            // filename you can create the Photo object in the database
            if (error) {
                response.status(400).send("unable to write file");
                return;
            }
            Photo.create(
                {
                    file_name: filename,
                    date_time: timestamp,
                    user_id: request.session.user_id,
                    comments: []
                }).then(newPhoto => {
                    newPhoto.save(function (errr) {
                        console.log(errr);
                    });
                    response.status(200).send('Added successfully.');
                }).catch(er => {
                    response.status(400).send(er);
                });
        });
    });

});

// register a new user
app.post("/user", function (request, response) {

    let userData = request.body.userData;
    User.findOne({ login_name: userData.login_name }).exec()
        .then(user => {
            if (user) {
                alert('User with login_name: ' + user.first_name + ' already exist');
                response.status(400).send("Duplicate user");
                console.log('User with login_name: ' + user.first_name + ' already exist');
                return;
            }
            // console.log(user)
            User.create({
                login_name: userData.login_name,
                password: userData.password,
                first_name: userData.first_name,
                last_name: userData.last_name,
                location: userData.location,
                description: userData.description,
                occupation: userData.occupation
            }).then(newUser => {
                // console.log(newUser)
                newUser.save(function (err) {
                    console.log(err);
                });
                response.status(200).send('Register successfully.');
            }).catch(err => {
                console.error('Doing /user error:', err);
                response.status(400).send(err);
            });

        }).catch(err => {
            console.error('Find user error:', err);
            response.status(400).send(err);
        });
});

// delete the entire account;
app.delete("/user/:id", function (request, response) {
    if (!request.session.login_name || !request.session.user_id) {
        response.status(401).send("Not logged in");
        return;
    }

    let user_id = request.params.id;
    Photo.find({}).exec()
        .then((photos) => {
            if (!photos) {
                response.status(400).send("Photos not found");
            }
            for (let i = 0; i < photos.length; i++) {
                let comments = photos[i].comments;
                for (var j = 0; j < comments.length; j++) {

                    if (comments[j].user_id.equals(ObjectId(user_id))) {
                        photos[i].comments.splice(j, 1);
                        j--;
                    }
                }
                photos[i].save(function (err) {
                    console.log(err);
                });
            }

        }).catch((err) => {
            console.log(err);
        });
    User.deleteOne({ _id: user_id }).exec()
        .then((user) => {
            if (!user) {
                response.status(400).send("User not found");
            }
            console.log("Photos deleted");
            Photo.deleteOne({ user_id: user_id }).exec()
                .then((photo) => {
                    if (!photo) {
                        response.status(400).send("Photo not found");
                    }
                    console.log("Photos deleted");
                }).catch((err) => console.log(err));

        }).catch((err) => {
            console.log(err);
            response.status(400).send("Not found");
        });
    response.status(200).send("Account Deleted");
});

// delete comments and photos
app.delete("/photos/:photo_id", function (request, response) {
    if (!request.session.login_name || !request.session.user_id) {
        response.status(401).send("Not logged in");
        return;
    }
    let photo_id = request.params.photo_id;
    Photo.findOne({ _id: photo_id }).exec()
        .then((photo) => {
            if (!photo) {
                console.log('Photo with _id:' + photo_id + ' not found.');
                response.status(400).send("Photo not found");
                return;
            }
            Photo.deleteOne({ _id: photo_id }).exec()
                .then(() => {
                    fs.unlink("./images/" + photo.file_name, (err) => {
                        if (err) {
                            console.log(err);
                        }
                        console.log("Photo deleted");
                    });
                    response.status(200).send("Photo deleted");
                }).catch((err) => {
                    console.log(err);
                });

        }).catch((err) => {
            console.log(err);
            response.status(400).send("Not found");
        });
});

app.delete("/comments/:photo_id/:comment_id", function (request, response) {
    if (!request.session.login_name || !request.session.user_id) {
        response.status(401).send("Not logged in");
        return;
    }
    let photo_id = request.params.photo_id;
    let comment_id = request.params.comment_id;

    Photo.findOne({ _id: photo_id }).exec()
        .then((photo) => {
            if (!photo) {
                console.log('Photo with _id:' + photo_id + ' not found.');
                response.status(400).send("Photo not found");
                return;
            }

            const isMatch = (element_id) => element_id._id === comment_id;
            let comments = JSON.parse(JSON.stringify(photo.comments));
            let index = comments.findIndex(isMatch);

            if (index !== -1) {
                photo.comments.splice(index, 1);
            }
            photo.save(function (err) {
                console.log(err);
            });
            response.status(200).send("Comment Deleted");

        }).catch((err) => {
            console.log(err);
            response.status(400).send("Not found");
        });
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


