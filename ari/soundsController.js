var Q = require('q');
var fs = require('fs');
var uuid = require('uuid');
var request = require('request');
var apiKey = "f63e33cd93a94084b0e0390b74b1f04c";
var baseUrl = "http://api.voicerss.org/?";
var config = require("./config/config");

soundsCtrl = function () {
    this.createBook = function (greeting) {
        console.log("=======================>Greeting", greeting);
        var deferred = Q.defer();
        greeting = greeting.split(" ").join("+");
        var url = baseUrl + "key=" + apiKey + "&src=" + greeting + "&hl=en-us&c=WAV&f=8khz_16bit_mono";
        var nameFile = uuid.v4();
        console.log(url);
        request
            .get(url)
            .on('error', function (err) {
                deferred.reject({
                    "error": 500,
                    "status": "unable to fetch file"
                });
            })
            .on('response', function (res) {
                var fileName = '/var/lib/asterisk/sounds/en/itp/' + nameFile + '.wav';
                res.pipe(
                    fs.createWriteStream(fileName).
                        on('close', function () {
                            console.log("Success: ", {
                                "success": 200,
                                "name": nameFile
                            });
                            deferred.resolve({
                                "success": 200,
                                "name": nameFile
                            })
                        }).on('error', function (err) {
                            console.log("ERROR: ", err);
                            deferred.reject({
                                "error": 500,
                                "status": "unable to fetch file"
                            })
                        })
                );
            });
        return deferred.promise;
    };
    this.downloadMoh = function (mohIid) {
        var deferred = Q.defer();
        var mohUrl = config['app_host'] + ':' + config['app_port'] + '/moh/' + mohIid;
        var nameFile = "voicelinx.itpscorp-" + uuid.v4();
        console.log(mohUrl);
        request
            .get(mohUrl)
            .on('error', function (err) {
                deferred.reject({
                    "error": 500,
                    "status": "unable to fetch file"
                });
            })
            .on('response', function (res) {
                var fileName = '/var/lib/asterisk/sounds/en/itp/' + nameFile + '.wav';
                res.pipe(
                    fs.createWriteStream(fileName).
                        on('close', function () {
                            deferred.resolve({
                                "success": 200,
                                "name": nameFile
                            })
                        }).on('error', function (err) {
                            console.log("ERROR: ", err);
                        })
                );
            });
        return deferred.promise;
    };
};

module.exports = soundsCtrl;