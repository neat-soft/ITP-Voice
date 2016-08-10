/**
 * Created by teliteck on 24/03/2016.
 */
var Q = require('q');
var request = require('request');
var uuid = require('uuid');
var parser = require('xml2json');
var config = require("./../../../config/vitelity/config.js");

var vitelityController = function() {
    this.searchByNPA = function (body) {
        var deferred = Q.defer();
        var cmd = "listnpa";
        var npa = body.npa;
        var data = "npa="+npa;
        this.vitelityApi(cmd, data)
            .then(function (list) {
                console.log(list);
                deferred.resolve(list);
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });
        return deferred.promise;
    };
    this.searchByNPANXX = function (body) {
        var deferred = Q.defer();
        var cmd = "listnpanxx";
        var npanxx = body.npanxx;
        var data = "npanxx="+npanxx;
        this.vitelityApi(cmd, data)
            .then(function (list) {
                console.log(list);
                deferred.resolve(list);
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });
        return deferred.promise;
    };
    this.getTollFree = function () {
        var deferred = Q.defer();
        var cmd = "listtollfree";
        this.vitelityApi(cmd, undefined)
            .then(function (list) {
                console.log(list);
                deferred.resolve(list);
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });
        return deferred.promise;
    };
    this.searchTollFree = function (body) {
        var deferred = Q.defer();
        var cmd = "searchtoll";
        var did = body.did;
        var data = "did="+did;
        this.vitelityApi(cmd, data)
            .then(function (list) {
                console.log(list);
                deferred.resolve(list);
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });
        return deferred.promise;
    };
    this.orderLocalNumber = function (body) {
        var deferred = Q.defer();
        var cmd = "getlocaldid";
        var did = body.did;
        var sbc = config.sbc;
        var data = "did="+did+"&routesip="+sbc;
        this.vitelityApi(cmd, data)
            .then(function (list) {
                console.log(list);
                deferred.resolve(list);
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });
        return deferred.promise;
    };
    this.orderTollFreeNumber = function (body) {
        var deferred = Q.defer();
        var cmd = "gettollfree";
        var did = body.did;
        var sbc = config.sbc;
        var data = "did="+did+"&routesip="+sbc;
        this.vitelityApi(cmd, data)
            .then(function (list) {
                console.log(list);
                deferred.resolve(list);
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });
        return deferred.promise;
    };
    this.removeNumber = function (body) {
        var deferred = Q.defer();
        var cmd = "removedid";
        var did = body.did;
        var data = "did="+did;
        this.vitelityApi(cmd, data)
            .then(function (list) {
                console.log(list);
                deferred.resolve(list);
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });
        return deferred.promise;
    };
    this.vitelityApi = function (cmd, data) {
        var deferred = Q.defer();
        var login = config.login;
        var password = config.password;
        var baseUrl = config.baseUrl;
        var url = baseUrl+"?login="+login+"&pass="+password+"&cmd="+cmd+"&xml=yes";
        if (data !== undefined)
            url = url + "&" + data;
        var options = {
            "url": url,
            "method": "POST"
        };
        console.log(url, options);
        request(options, function (err, req, res) {
            var json = parser.toJson(res); //returns a string containing the JSON structure by default
            //console.log(json, typeof json, json.content);
            if (typeof json === "string")
                json = JSON.parse(json);
            console.log(json, typeof json, json.content);
            if ("content" in json
                && (("response" in json.content
                && json.content.response == "success") || ("status" in json.content
                && json.content.status == "ok"))) {
                console.log("res", json);
                deferred.resolve(json);
            } else {
                console.log("err", err, json);
                deferred.reject(json);
            }
        });
        return deferred.promise;
    };
};

module.exports = vitelityController;
