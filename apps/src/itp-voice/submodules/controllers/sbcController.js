/**
 * Created by root on 10/05/16.
 */
var Sbc = require('mongoose').model('Sbc');
var Q = require('q');

var db = function(){
    var self = this;
    this.addSbc = function (sbc) {
        var deferred = Q.defer();
        var newSbc = new Sbc(sbc);
        newSbc.save(function (err, data) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.getSbcById = function(id) {
        var deferred = Q.defer();
        Sbc.findById(id, function(err, sbc) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(sbc);
            }
        });
        return deferred.promise;
    };
    this.updateSbcById = function(id,body) {
        var deferred = Q.defer();
        Sbc.findByIdAndUpdate(id, body, function(err, sbc) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(sbc);
            }
            console.log(sbc);
        });
        return deferred.promise;
    };
    this.deleteSbcById  = function(id) {
        var deferred = Q.defer();
        Sbc.findByIdAndRemove(id, function(err) {
            if (err) {
                deferred.reject(err);
            } else {
                console.log('Sbc deleted!');
                deferred.resolve("{success : Sbc deleted}");
            }
        });
        return deferred.promise;
    };
    this.getAllSbcs = function() {
        var deferred = Q.defer();
        Sbc.find({}, function(err, sbcs) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(sbcs);
            }
        });
        return deferred.promise;
    };
    this.getRandomSbc = function() {
        var deferred = Q.defer();
        var resultAll = self.getAllSbcs();
        resultAll.then( function(sbcs) {
            var sbc = sbcs[Math.floor(Math.random()*sbcs.length)];
            if(sbc)
                deferred.resolve(sbc);
            else
                deferred.reject({error: "Can't get a random SBC !!"});
        }, function(err){
            deferred.reject({error: "Can't get a random SBC !!"});
        })
        return deferred.promise;
    };
};

module.exports = db;