/**
 * Created by Lucas on 30/11/15.
 */
var User = require('mongoose').model('User');
var Q = require('q');
var randomstring = require("randomstring");

var db = function () {
    var self = this;
    this.addUser = function (user) {
        var deferred = Q.defer();
        var newUser = new User(user);
        if (!("username" in user)) {
            var username = "user_" + randomstring.generate({
                    length: 4,
                    charset: 'alphanumeric'
                });
            newUser.username = username;
        }
        if (!("password" in user)) {
            var password = randomstring.generate({
                length: 8,
                charset: 'alphanumeric'
            });
            newUser.password = password;
        }
        newUser.save(function (err, data) {
            if (err) {
                deferred.reject(err);
                console.log(err);
            }
            else {
                console.log(data);
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.getAllUsers = function () {
        var deferred = Q.defer();
        User.find({}, function (err, users) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(users);
            }
            console.log(users);
        });
        return deferred.promise;
    };
    this.listUsersByAccount = function (accountID) {
        var deferred = Q.defer();
        console.log({account: accountID});
        User.find({account: accountID}, function (err, data) {
            if (err) {
                deferred.reject({error:"error listing users by account"});
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.getUserById = function (id, account) {
        var deferred = Q.defer();
        User.findById(id, function (err, user) {
            if (err || !user) {
                deferred.reject({error : "User not found"});
            } else {
                if (account === undefined || account.toString() === user.account.toString()) {
                    console.log("user resolved: ", user);
                    deferred.resolve(user);
                } else {
                    console.log("user rejected: ", account, user.account);
                    deferred.reject({error : "User not found"});
                }
            }
        });
        return deferred.promise;
    };
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        console.log("body", body, "account" in body);
        if (!("account" in body)) {
            User.findByIdAndUpdate(id, body, function (err, user) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(user);
                }
            });
        } else {
            var query = {
                _id: id,
                account: body.account
            };
            console.log("query", query);
            User.findOneAndUpdate(query, body, function (err, user) {
                console.log(err, user);
                if (user !== null) {
                    deferred.resolve(user);
                } else {
                    deferred.resolve({error : "User not found"});
                }
            });
        }
        return deferred.promise;

    };
    this.deleteById = function (id, account) {
        var deferred = Q.defer();
        console.log("deleteById", account);
        if (account === undefined) {
            User.findByIdAndRemove(id, function (err, user) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(user);
                }
            });
        } else {
            var query = {
                _id: id,
                account: account
            };
            console.log("query", query);
            User.findOneAndRemove(query, function (err, user) {
                console.log(err, user);
                if (user !== null) {
                    deferred.resolve(user);
                } else {
                    deferred.resolve({error : "User not found"});
                }
            });
        }
        return deferred.promise;
    };
    this.getUserByDevice = function (idDevice) {
        console.log("Get user by id device", idDevice, typeof idDevice);
        var deferred = Q.defer();
        User.findOne({ "devices": idDevice }, function(err, user) {
            if (user == null) {
                deferred.reject({error:"User not found!", user:user});
                console.log("user NULL !!!!", user);
            } else {
                deferred.resolve(user);
                console.log("user",user);
            }
        });
        return deferred.promise;
    };
    /*Not Used*/
    this.getUser = function (user) {
        var deferred = Q.defer();
        User.find({username: user.username}, function (err, user) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(user);
            }
        });
        return deferred.promise;
    };
    this.updateByUsername = function (username, body) {
        var deferred = Q.defer();
        User.findOneAndUpdate(username, body, function (err, user) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(user);
            }
        });
        return deferred.promise;
    };
    this.deleteUser = function (user) {
        var deferred = Q.defer();
        User.remove(function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve({success : "User deleted"});
            }
        });
        return deferred.promise;
    };
    this.deleteByUsername = function (username) {
        var deferred = Q.defer();
        User.findOneAndRemove(username, function (err) {
            if (err) {
                console.log("error while deleting user");
                deferred.reject(err);
            } else {
                deferred.resolve({success : "User deleted"});
            }
        });
        return deferred.promise;
    };
};

module.exports = db;
