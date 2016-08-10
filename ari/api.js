/**
 * Created by root on 22/04/16.
 */

var request = require('request');
var Q = require('q');
var config = require('./config/config');
var uuid = require('uuid');
var fs = require('fs');
var restler = require('restler');

var db = function () {
    var self = this;
    this.getRandomSbc = function (account) {
        var deferred = Q.defer();
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/' + account + '/sbc/random' + config.apiKey;
        request({
            url: url,
            method: "GET"
        }, function (err, response, sbc) {
            if (err) {
                console.log("Error from getRandomSbc", err);
                deferred.resolve(err);
            } else {
                deferred.resolve(sbc);
            }
        });
        return deferred.promise;
    };
    this.downloadMoh = function (mohIid) {
        var deferred = Q.defer();
        var mohUrl = config['app_host'] + ':' + config['app_port'] + '/moh/' + mohIid + config.apiKey;
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
                var fileName = '/var/lib/asterisk/sounds/en/voice.itpscorp/' + nameFile + '.wav';
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
    this.addClientToQ = function(json, account) {
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/api/addClientToQ';
        console.log("AddClientToQ: ", json);
        request({
            "rejectUnauthorized": false,
            "url": url,
            "method": "POST",
            headers: {
                "content-type": "application/json"
            },
            json: json
        }, function (err, response, clientsQ) {
            if(err)
                console.log("Error to addClienttoQ: ", err);
            else
                console.log("Result addClientToQ: ", clientsQ);
        });
    };
    this.lookupQAgents = function(json, account) {
        var deferred = Q.defer();
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/api/lookupQAgents';
        console.log("LookupQAgents: ", json);
        request({
            "rejectUnauthorized": false,
            "url": url,
            "method": "POST",
            headers: {
                "content-type": "application/json"
            },
            json: json
        }, function (err, response, agentsQ) {
            console.log("Result lookupQAgents: ", JSON.stringify(agentsQ));
            if(!err)
                deferred.resolve(agentsQ);
            else
                deferred.reject(err);
        });
        return deferred.promise;
    };
    this.removeClientFromQ = function(json, account) {
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/api/removeClientFromQ';
        console.log("RemoveClientFromQ: ", json);
        request({
            "rejectUnauthorized": false,
            "url": url,
            "method": "POST",
            headers: {
                "content-type": "application/json"
            },
            json: json
        }, function (err, response, clientsQ) {
            if(!err)
                console.log("Result removeClientFromQ: ", clientsQ);
        });
    };
    this.updateClientQ = function(json, account) {
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/api/updateClientQ';
        console.log("updateClientQ: ", json);
        request({
            "rejectUnauthorized": false,
            "url": url,
            "method": "POST",
            headers: {
                "content-type": "application/json"
            },
            json: json
        }, function (err, response, clientsQ) {
            if(!err)
                console.log("Result updateClientQ: ", clientsQ);
        });
    };

    //added from originateResource
    this.addUpdateCdr = function (from, to, jsonReq, account) {
        var deferred = Q.defer();
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/' + account + '/callLog/updateOrAddCallLog/' + from + "/" + to + config['apiKey'];
        console.log("Update Cdr: ", url, jsonReq);
        request({
            url: url,
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            json: jsonReq
        }, function (err, response, cdr) {
            if (err) {
                console.log("Error from addUpdateCdr", err);
                deferred.resolve(err);
            } else {
                console.log("Add Update CDR result: ", cdr);
                deferred.resolve(cdr);
            }
        });
        return deferred.promise;
    };
    this.getCdr = function (from, account) {
        var deferred = Q.defer();
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/' + account + '/callLog/getCallLogByFrom/' + from + config['apiKey'];
        console.log("Get Cdr: ", url);
        request({
            url: url,
            method: "GET"
        }, function (err, response, cdr) {
            if (err) {
                console.log("Error from getCdr", err);
                deferred.resolve(err);
            } else {
                if (typeof cdr == 'string')
                    cdr = JSON.parse(cdr);
                console.log("Get CDR result: ", cdr);
                deferred.resolve(cdr);
            }
        });
        return deferred.promise;
    };
    this.addActiveCall = function (json, account) {
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/active-call/addActiveCall' + config.apiKey;
        console.log("Add Active Call: ", url);
        request({
            url: url,
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            json: json
        });
    };
    this.deleteActiveCall = function (from, to, account) {
        if (from !== undefined && to !== undefined) {
            var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/active-call/deleteActiveCall/' + from + '/' + to + config.apiKey;
            console.log("Delete Active call: ", url);
            request({
                url: url,
                method: "DELETE",
                headers: {
                    "content-type": "application/json"
                }
            });
        } else {
            console.log("no active call to delete !");
        }
    };
    this.getExternalBySip = function (sip, callee, account) {
        var deferred = Q.defer();
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/' + account + '/device/external' + config.apiKey;
        var data = {
            sip: sip,
            callee: callee
        };
        request({
            url: url,
            method: "POST",
            json: data
        }, function (err, response, external) {
            if (err) {
                console.log("Error from getExternalBySip", err);
                deferred.resolve(err);
            } else {
                deferred.resolve(external);
            }
        });
        return deferred.promise;
    };
    this.getDevice = function (sip, account) {
        var deferred = Q.defer();
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/' + account + '/device' + config.apiKey;
        var data = {username: sip};
        console.log(url);
        request({
            url: url,
            method: "POST",
            json: data
        }, function (err, response, device) {
            if (err) {
                console.log("Error from getDevice", err);
                deferred.resolve(err);
            } else {
                console.log("External api", device);
                deferred.resolve(device);
            }
        });
        return deferred.promise;
    };
    this.uploadRecording = function (obj, account) {
        var nameForm = obj.name + '.wav';
        fs.stat('/var/spool/asterisk/recording/'  + nameForm, function (err, stats) {
            console.log("uploadRecording:", err, stats);
            if(err){
                console.log("Error to upload Recording");
            }else {
                var url = config["app_host"] + ':' + config["app_port"] + '/accounts/' + account + '/recording/add-record' + config.apiKey;
                restler.post(url, {
                    multipart: true,
                    data: {
                        "filename": nameForm,
                        "from": obj.from,
                        "to": obj.to,
                        "audio": restler.file('/var/spool/asterisk/recording/' + nameForm, null, stats.size, null, "audio/wav"),
                        "type": obj.type,
                        "account": obj.account
                    }
                }).on("complete", function (data) {
                    console.log('Recording upload completed ', data);
                });
            }
        });
    };

    //Added from daemon "MenuResource"
    this.getMenuOptionByDigit = function(json, account){
        var deferred = Q.defer();
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/api/getMenuOptionByDigit';
        console.log("url: ", url, json);
        request({
            "rejectUnauthorized": false,
            "url": url,
            "method": "POST",
            headers: {
                "content-type": "application/json"
            },
            json: json
        }, function (err, response, option) {
            if (option != null && option !== undefined) {
                var responseJson = {};
                switch (option.data.type) {
                    case "device":
                        responseJson.module = option.data.sip_settings;
                        responseJson.type = 'device';
                        break;
                    case "ringGroup":
                        responseJson.module = option.data.resources;
                        responseJson.type = 'ringGroup';
                        break;
                    case "offNet":
                        responseJson.module = option.data.number;
                        responseJson.type = 'offNet';
                        break;
                }
                deferred.resolve(responseJson);
            } else {
                deferred.reject({error: "Option is " + option});
                console.log("Option is ", option);
            }
            if (err) {
                deferred.reject(err);
                console.log("error From daemon getMenuOptionByDigit", err);
            }
        });
        return deferred.promise;
    };
    //Added from daemon
    this.getResource = function (json, extension, realm) {
        var deferred = Q.defer();
        var url = config.app_host + ':' + config.app_port + '/accounts/' + realm + '/api/resource/' + extension + config.apiKey;
        console.log("===================> URL", url);
        request({
            "rejectUnauthorized": false,
            "url": url,
            "method": "POST",
            headers: {
                "content-type": "application/json"
            },
            json: json
        }, function (err, response, resource) {
            if (err || response.statusCode > 400) {
                console.log(err);
                deferred.reject(err);
                //TODO: hangup call
            } else {
                if (typeof resource == 'string')
                    resource = JSON.parse(resource);
                deferred.resolve(resource);
            }
        });
        return deferred.promise;
    };
    this.noAnswerAction = function(channel, account, extension){
        var deferred = Q.defer();
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/api/no-answer-action/' + extension + config.apiKey;
        var json =
        {
            channelId: channel
        };
        request({
            "rejectUnauthorized": false,
            "url": url,
            "method": "POST",
            headers: {
                "content-type": "application/json"
            },
            json: json
        }, function (err, response, data) {
            if (err) {
                deferred.reject({error: "error from getNoAnswerAction " + err});
            } else {
                if (data != null && data !== undefined) {
                    deferred.resolve(data);
                } else {
                    deferred.reject({error: "action noAnswer " + data});
                }
            }
        });
        return deferred.promise;
    };
    this.updateAgentStatus = function(json, account) {
        var deferred = Q.defer();
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/api/updateAgentStatus' + config.apiKey;
        console.log(url, json, account);
        request({
            "rejectUnauthorized": false,
            "url": url,
            "method": "POST",
            headers: {
                "content-type": "application/json"
            },
            json: json
        }, function (err, response, qNames) {
            console.log("=======================> updatedAgent=============>Status============>: ", json);
            console.log("=======================> Qnames=============>============>: ", qNames);
            deferred.resolve(qNames);
        });
        return deferred.promise;
    };
};

module.exports = db;