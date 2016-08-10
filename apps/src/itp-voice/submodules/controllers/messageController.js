/**
 * Created by Lucas on 30/11/15.
 */
var Message = require('mongoose').model('Message');
var Q = require('q');
var fs = require('fs');
var mongoose = require('mongoose');
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db);
var shortId = require('short-id');

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
    this.addRecording = function (path) {
        console.log("Add MEssage controller", path);
        var deferred = Q.defer();
        var extension = path.split(/[. ]+/).pop();
        var writestream = gfs.createWriteStream({
            filename: shortId.generate() + '.' + extension
        });
        fs.createReadStream(path).pipe(writestream);
        writestream.on('close', function (file) {
            console.log("file Add message: ", file);
            deferred.resolve(file);
        }).on('error', function (err) {
            console.log("ERROR: ", err);
            deferred.reject(err);
        });
        return deferred.promise;
    };
    this.addMessage = function (message) {
        console.log("addMessage From Controller\n" + message);
        var newMessage = new Message(message);
        var deferred = Q.defer();
        newMessage.save(function (err, data) {
            if (err) {
                deferred.reject(err);
                console.log(err);
            }
            else {
                console.log("Message added", data);
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.getAllMessages = function () {
        var deferred = Q.defer();
        Message.find({}, function (err, messages) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(messages);
            }
            console.log(messages);
        });
        return deferred.promise;
    };
    this.getMessage = function (message) {
        var deferred = Q.defer();
        Message.findOne({name: message.name}, function (err, message) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(message);
            }
            console.log(message);
        });
        return deferred.promise;
    };
    this.getMessageById = function (id) {
        console.log("Get message by id");
        var deferred = Q.defer();
        //write content to file system
        var options = {_id: id};
        gfs.exist(options, function (err, found) {
            if (err) {
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

    this.getMessagesOfMailbox = function (idMailbox) {
        console.log("Inside getMessagesOfMailbox ");
        var deferred = Q.defer();
        Message.find({id_mailbox: idMailbox}, function (err, messages) {
            if(err){
                console.log("Error retrieving messages");
                deferred.reject({error:"Error retrieving messages"});
            }
            if (messages == null) {
                console.log("Messages are null",messages);
                deferred.reject({ERROR: "message not found!"});
            } else {
                console.log("Messages found",messages);
                deferred.resolve(messages);
            }
        });
        return deferred.promise;
    };
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        Message.findByIdAndUpdate(id, body, function (err, message) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(message);
            }
            console.log("message\n" + message);
        });
        return deferred.promise;

    };
    this.deleteMessage = function (message) {
        var deferred = Q.defer();
        Message.remove(function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve({success: "Message deleted"});
            }
            console.log('Message deleted!');
        });
        return deferred.promise;
    };
    this.deleteById = function (id) {
        var deferred = Q.defer();
        Message.findByIdAndRemove(id, function (err) {
            if (err) {
                deferred.reject({error: "error while deleting message !"});
            } else {
                deferred.resolve({success: "Message deleted"});
            }
            console.log('Message deleted!');
        });
        return deferred.promise;
    };
};

module.exports = db;