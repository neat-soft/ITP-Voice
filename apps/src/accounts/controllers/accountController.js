/**
 * Created by Lucas on 30/11/15.
 */
var Account = require('mongoose').model('Account');
var config = require('./../../config/config');
var UserController = require('./../../users/controllers/userController');
var userController = new UserController();
var Q = require('q');
var uuid = require('uuid');
var randomstring = require("randomstring");

var db = function () {
    var self = this;
    this.addAccount = function (account) {
        var deferred = Q.defer();
        var key = uuid.v4();
        var accountObj = {};
        accountObj.name = account.name;
        accountObj.enabled = account.enabled;
        accountObj.website = account.website;
        accountObj.email = account.email;
        accountObj.type = account.type;
        accountObj.accountNumber = account.accountNumber;
        accountObj.numberOfEmployees = account.numberOfEmployees;
        accountObj.netTerms = account.netTerms;
        accountObj.accountStatus = account.accountStatus;
        accountObj.key = key;
        accountObj.role = "admin";
        accountObj.realm = randomstring.generate({length: 4, charset: 'alphanumeric'}) + "." + config.base_url;
        var newAccount = new Account(accountObj);
        newAccount.save(function (err, data) {
            if (err) {
                deferred.reject(err);
            } else {
                if ("user" in account)
                    var user = account.user;
                else
                    var user = {};
                user.account = data._id;
                userController.addUser(user)
                    .then(function (user) {
                        deferred.resolve(data);
                    }, function (err) {
                        deferred.reject(err);
                    });
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.getAllAccounts = function (accountID) {
        var deferred = Q.defer();
        var query = {};
        if(accountID)
            query= {_id: accountID};
        Account.find(query, function (err, accounts) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(accounts);
            }
        });
        return deferred.promise;
    };
    this.getAccount = function (filter) {
        var deferred = Q.defer();
        this.getAccountById(filter)
            .then(function(accountRealm){
                deferred.resolve(accountRealm);
            }, function(err){
                Account.findOne({realm: filter}, function (err, account) {
                    if (err) {
                        deferred.reject({error: "account not found"});
                    } else {
                        if(account !== null)
                            deferred.resolve(account);
                        else
                            deferred.reject({error: "account not found"});
                    }
                });
            });
        return deferred.promise;
    };
    this.getAccountById = function (id) {
        var deferred = Q.defer();
        Account.findById(id, function (err, account) {
            if (err) {
                deferred.reject({error: "account not found"});
            } else {
                if(account !== null)
                    deferred.resolve(account);
                else
                    deferred.reject({error: "account not found"});
            }
        });
        return deferred.promise;
    };

    this.getAccountByApiKey = function (apiKey) {
        var deferred = Q.defer();
        Account.find({key: apiKey}, function (err, account) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(account);
            }
        });
        return deferred.promise;
    };
    this.updateAccount = function (filter, body) {
        var deferred = Q.defer();
        var data = {
            enabled: body.enabled
        };
        var query = {
            name: filter
        };
        Account.update(query, data, {upsert: false}, function (err, result) {
            if (err || result.n === 0 || result.ok === 0) {
                data = {
                    //name: body.name,
                    enabled: body.enabled
                };
                query = {
                    _id: filter
                };
                Account.update(query, data, {upsert: false}, function (err, result) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(result);
                    }
                });
            } else {
                deferred.resolve(result);
            }
        });
        return deferred.promise;
    };
    this.deleteAccount = function (filter) {
        var deferred = Q.defer();
        var query = {
            name: filter
        };
        Account.remove(query,function (err, result) {
            if (err || result.result.n === 0 || result.ok === 0) {
                query = {
                    _id: filter
                };
                Account.remove(query,function (err) {
                    if (err) {
                        deferred.resolve("{error : Account not found}");
                    } else {
                        deferred.resolve("{success : Account deleted}");
                    }
                });
            } else {
                deferred.resolve("{success : Account deleted}");
            }
        });
        return deferred.promise;
    };
};

module.exports = db;
