/**
 * Created by Lucas on 30/11/15.
 */

var Q = require('q');
var jwt = require('jsonwebtoken');
var secret = require('./config/secret');

loginCtrl = function () {
    var self = this;
    this.check = function (data, req) {
        var deferred = Q.defer();
        console.log("data\n" + data);
        var username = data.username || '';
        var password = data.password || '';
        console.log("username & password");
        console.log(data.username);
        console.log(data.password);
        if (username == '' || password == '') {
            deferred.reject(401);
        }
        if (username == "admin" && password == "pass") {
            var token = jwt.sign({username: 'admin', password: 'pass'}, secret.secretToken, {expiresIn: 3600});
            deferred.resolve({token: token});
        } else {
            console.log("Erreur d'authentification ! ");
            deferred.reject(401);
        }
        return deferred.promise;
    };
};

module.exports = loginCtrl;

