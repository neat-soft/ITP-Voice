/**
 * Created by Lucas on 13/04/16.
 */

var express = require('express');
var formidable = require('formidable');
var router = express.Router();
var Recordings = require('../../controllers/recordingController');
var recordings = new Recordings();

router.post('/add-record', function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log('Fields', fields);
        console.log('File : ', files);
        if ("audio" in files && "name" in files.audio)
            var name = files.audio.name;
        else
            var name = "";
        if ("audio" in files && "path" in files.audio)
            var path = files.audio.path;
        else
            var path = "";
        if ("account" in fields)
            var account = fields.account;
        else
            var account = "";
        if ("type" in fields)
            var type = fields.type;
        else
            var type = "";
        if ("from" in fields)
            var from = fields.from;
        else
            var from = "";
        if ("to" in fields)
            var to = fields.to;
        else
            var to = "";
        var recording = {
            filename: name,
            audio: path,
            account: account,
            type: type,
            from: from,
            to: to
        };
        console.log('recording', recording);
        var result = recordings.addRecording(recording);
        console.log('result', result);
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    });

});

router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    var result = recordings.getRecordingById(id);
    result.then(function (readstream) {
        //console.log(response);
        readstream.pipe(res);
        //res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });

});

module.exports = router;