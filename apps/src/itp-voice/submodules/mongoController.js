/**
 * Created by teliteck   on 10/08/15.
 */

var Db = require('mongodb').Db;
var ObjectId = require('mongodb').ObjectID;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var events = require('events');
var eventEmitter = new events.EventEmitter();
var connectionInstance;
var q = require('q');
var _ = require('underscore');

var mongoose = require('mongoose');
//var uri = 'mongodb://mongo01.voice.itpscorp.com:27017/ITP';
var uri = 'mongodb://192.112.255.31:27017/ITP';
var User = require('./User');

//var database = "ITP", port = 27017, host = "mongo01.voice.itpscorp.com", username="admin", password="pass";


mongoose.connect(uri,function(err) {
    if (err) {
        console.log(err);//throw err;
    }
});

var connexion = mongoose.connection;

connexion.on('error', function(err){
    console.log('Erreur de connection', err);

});
connexion.on('open', function () {
    console.log('Connection établie.');
});
connexion.on('disconnected', function(err){
    console.log('Déconnecté');
});
var db = function(){
    var self = this;
    this.addObject = function (obj) {
        var newUser = new User(obj);
        var deferred = Q.defer();
        newUser.save(function (err, data) {
            if (err) {
                deferred.reject(err);
                console.log(err);
            }
            else {
                console.log(data);
                deferred.resolve(data);
            }
            return deferred.promise;
            console.log('User saved successfully!');
        });
    };
    this.getAllUsers = function () {
        var deferred = Q.defer();

        User.find({}, function(err, users) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(users);
            }
            return deferred.promise;
            console.log(users);
        });
    };
    this.getUser = function(user){
        User.find({ username: user.username }, function(err, user) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(user);
            }
            return deferred.promise;
            console.log(user);
        });
    };
    this.getUserById = function(id) {
        User.findById(id, function(err, user) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(user);
            }
            return deferred.promise;
            console.log(user);
        });
    }

};

module.exports = db;

