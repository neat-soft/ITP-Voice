/**
 * Created by Lucas on 30/11/15.
 */
var Moh = require('mongoose').model('Moh');
var Q = require('q');
var fs = require('fs');
var mongoose = require('mongoose');
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db);

function base64_encode(file) {
    var deferred = Q.defer();
    fs.readFile(file, function (err, data) {
        if (err) {
            console.log(err);
            deferred.reject(err);
        } else {
            var base64data = new Buffer(data).toString('base64');
            deferred.resolve(base64data);
        }
    });
    return deferred.promise;
}
function base64_decode(base64str, file) {
    var audio = new Buffer(base64str, 'base64');
    fs.writeFile(file, audio, function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('It\'s saved! ', data);
        }
    });
}
var db = function () {
    var self = this;
    // We use Grid_FS, BASE64 Encode was tested
    /*
     this.addMoh = function(moh) {
     var deferred = Q.defer();
     var newMoh = new Moh();
     var resultMoh = base64_encode(moh.audio);
     resultMoh.then(function (audioMoh) {
     newMoh.audio = audioMoh;
     newMoh.filename = moh.filename;
     newMoh.save(function (err, audio) {
     if (err) {
     deferred.reject(err);
     }
     else {
     deferred.resolve(audio);
     }
     });
     }, function (error) {
     console.log(err);
     });
     return deferred.promise;
     };
     */
    this.addMoh = function (fields, files) {        
        var deferred = Q.defer();
        if ("audio" in files && "name" in files.audio)
            var name = files.audio.name;
        else
            var name = "";
        if ("audio" in files && "path" in files.audio)
            var path = files.audio.path;
        else
            var path = "";
        var account = fields.account;
        var moh = {
            filename: name,
            audio: path,
            account: account
        };
        var writestream = gfs.createWriteStream({
            filename: moh.filename
        });
        fs.createReadStream(moh.audio).pipe(writestream);
        writestream.on('close', function (file) {
            console.log("file: ", file);
            var newMoh = new Moh();
            newMoh.filename = moh.filename;
            newMoh.gfs_id = file._id;
            console.log(moh, newMoh);
            newMoh.save(function (err, data) {
                if (err) {
                    deferred.reject(err);
                    console.log(err);
                }
                else {
                    console.log(data);
                    deferred.resolve(data);
                }
            });
        }).on('error', function (err) {
            console.log("ERROR: ", err);
        });
        return deferred.promise;
        /*var deferred = Q.defer();
        var newMoh = new Moh(moh);
        console.log(newMoh);
        // conn.once('open', function () {
        // var gfs = Grid(conn.db, mongoose);
        var writestream = gfs.createWriteStream({
            filename: newMoh.filename
        });
        fs.createReadStream(newMoh.audio).pipe(writestream);
        writestream.on('close', function (file) {
            // do something with `file`
            console.log("file: ", file);
            deferred.resolve(file);
        }).on('error', function (err) {
            console.log("ERROR: ", err);

            deferred.reject(err);
        });
        // });
        return deferred.promise;*/
    };
    this.getAllMohs = function () {
        var deferred = Q.defer();
        Moh.find({}, function (err, mohs) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(mohs);
            }
            console.log(mohs);
        });
        return deferred.promise;
    };
    this.getMoh = function (moh) {
        var deferred = Q.defer();
        Moh.findOne({mohname: moh.mohname}, function (err, moh) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(moh);
            }
            console.log(moh);
        });
        return deferred.promise;
    };
    this.getMohById = function (id) {
        console.log("Get moh by id");
        var deferred = Q.defer();
        //write content to file system
        var options = {_id: id};
        gfs.exist(options, function (err, found) {
            if (err || found === false) { // TODO: Respond whit default Moh
                deferred.reject(err);
            } else {
                // var fs_write_stream = fs.createWriteStream('/home/harraz/Development/ITP-Voice-Platform/apps/src/mongo/controllers/wavFiles/audio2.wav');
                //read from mongodb
                var readstream = gfs.createReadStream({
                    _id: id
                });
                deferred.resolve(readstream);
                /*fs_write_stream.on('close', function (file) {
                 console.log('file has been written fully!', file);
                 deferred.resolve(file);
                 }).on('error', function (err) {
                 console.log(err);
                 });*/
            }
        });

        return deferred.promise;
    };

    this.getMohByExtension = function (extension) {
        var deferred = Q.defer();
        Moh.findOne({extension: extension}, function (err, moh) {
            if (moh == null) {
                deferred.reject({ERROR: "moh not found!"});
            } else {
                deferred.resolve(moh);
            }
        });
        return deferred.promise;
        console.log("Moh By extension : ", moh);

    };
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        Moh.findByIdAndUpdate(id, body, function (err, moh) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(moh);
            }
            console.log("moh\n" + moh);
        });
        return deferred.promise;

    };
    this.updateQ = function (id, body) {
        var deferred = Q.defer();
        Moh.findByIdAndUpdate(id, body, function (err, moh) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(moh);
            }
            console.log("moh\n" + moh);
        });
        return deferred.promise;

    };
    this.addUserToQ = function (id, user) {
        console.log("add user to Q");
        var deferred = Q.defer();
        Moh.findByIdAndUpdate(id, {$push: {users: user}}, {safe: true, upsert: true}, function (err, moh) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(moh);
            }
        });
        return deferred.promise;
    };
    this.updateByMohname = function (mohname, body) {
        var deferred = Q.defer();
        Moh.findOneAndUpdate(mohname, body, function (err, moh) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(moh);
            }
            console.log("moh:\t" + moh);
        });
        return deferred.promise;
    };
    this.deleteMoh = function (moh) {
        var deferred = Q.defer();
        Moh.remove(function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve({success: "Moh deleted"});
            }
            console.log('Moh deleted!');
        });
        return deferred.promise;
    };
    this.deleteByMohname = function (mohname) {
        var deferred = Q.defer();
        Moh.findOneAndRemove(mohname, function (err) {
            if (err) {
                console.log("error while deleting moh");
                deferred.reject(err);
            } else {
                deferred.resolve({success: "Moh deleted"});
            }
            console.log('Moh deleted!');
        });
        return deferred.promise;
    };
    this.deleteById = function (id) {
        var deferred = Q.defer();
        Moh.findByIdAndRemove(id, function (err) {
            if (err) {
                deferred.reject({error: "error while deleting moh !"});
            } else {
                deferred.resolve({success: "Moh deleted"});
            }
            console.log('Moh deleted!');
        });
        return deferred.promise;
    };
};

module.exports = db;