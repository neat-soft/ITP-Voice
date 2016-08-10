/**
 * Created by Lucas on 13/04/16.
 */
var Recording = require('mongoose').model('Recording');
var Q = require('q');
var fs = require('fs');
var mongoose = require('mongoose');
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db);

var recordingController = function () {
    var self = this;
    this.addRecording = function (recording) {
        var deferred = Q.defer();
        var writestream = gfs.createWriteStream({
            filename: recording.filename
        });
        fs.createReadStream(recording.audio).pipe(writestream);
        writestream.on('close', function (file) {
            // do something with `file`
            console.log("file: ", file);
            var newRecord = new Recording();
            newRecord.filename = recording.filename;
            newRecord.account = recording.account;
            newRecord.type = recording.type;
            newRecord.gfs_id = file._id;
            newRecord.resource = {};
            newRecord.resource.from = recording.from;
            newRecord.resource.to = recording.to;
            console.log(recording, newRecord);
            newRecord.save(function (err, data) {
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
    };
    this.getRecordingById = function (id) {
        console.log("Get recording by id");
        var deferred = Q.defer();
        //write content to file system
        Recording.findById(id, function (err, recording) {
            if (err || !recording)
            deferred.reject({error: "recording not found"});
            else {
                var id = recording.gfs_id;
                var options = {_id: id};
                gfs.exist(options, function (err, found) {
                    if (err) {
                        deferred.reject({error: "recording not found"});
                    } else {
                        var readstream = gfs.createReadStream({
                            _id: id
                        });
                        deferred.resolve(readstream);
                    }
                });
            }
        });
        return deferred.promise;
    };

};

module.exports = recordingController;