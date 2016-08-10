/**
 * Created by Lucas on 30/11/15.
 */
var MailBox = require('mongoose').model('MailBox');
var Q = require('q');
var Devices = require('./deviceController');
var Users = require('./../../../users/controllers/userController');
var devices = Devices;
var users = new Users();
var db = function () {
    var self = this;
    /*this.addMailBox = function (mailBox) {
        var newMailBox = new MailBox(mailBox);
        var deferred = Q.defer();
        newMailBox.save(function (err, data) {
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
        console.log('MailBox saved successfully!');
    };
    this.getAllMailBoxs = function () {
        var deferred = Q.defer();
        MailBox.find({}, function (err, mailBoxs) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(mailBoxs);
            }
            console.log(mailBoxs);
        });
        return deferred.promise;
    };
    this.getMailBox = function (mailBox) {
        var deferred = Q.defer();
        MailBox.find({mailBoxname: mailBox.mailBoxname}, function (err, mailBox) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(mailBox);
            }
            console.log(mailBox);
        });
        return deferred.promise;
    };
    this.getMailBoxBySip = function (sip) {
        var deferred = Q.defer();
        var resultInternal = devices.getInternalBySip(sip);
        resultInternal.then(function (internal) {
            var resultDevice = devices.getDeviceByInternal(internal);
            resultDevice.then(function (device) {
                if (typeof device == 'string')
                    device = JSON.parse(device);
                var idDevice = JSON.stringify(device._id);
                idDevice = idDevice.replace(/^"(.*)"$/, '$1');
                var resultUser = users.getUserByDevice(idDevice);
                resultUser.then(function (user) {
                    if (typeof user == 'string')
                        user = JSON.parse(user);
                    var idUser = JSON.stringify(user._id);
                    idUser = idUser.replace(/^"(.*)"$/, '$1');
                    var resultMailBox = self.getMailBoxByUser(idUser);
                    resultMailBox.then(function (mailbox) {
                        console.log("mailBox get by Sip", mailbox);
                        deferred.resolve(mailbox);
                    }, function (error) {
                        console.log("Error resultMailbox");
                        deferred.reject({error: "Error resultMailbox"});
                    });
                }, function (error) {
                    console.log("Error resultUser");
                    deferred.reject({error: "Error resultUser"});
                });
            }, function (error) {
                console.log("error resultDevice ::GetMailBoxBySip");
                deferred.reject({error: "error resultDevice ::GetMailBoxBySip"});
            });
        }, function (error) {
            console.log("error resultInternal");
        });
        return deferred.promise;
    };
    this.getMailBoxById = function (id) {
        console.log("Get mailBox by id");
        var deferred = Q.defer();
        MailBox.findById(id, function (err, mailBox) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(mailBox);
            }
            console.log(mailBox);
        });
        return deferred.promise;
    };
    this.getMailBoxByDevice = function (idDevice) {
        console.log("Get mailBox by id device", idDevice);
        var deferred = Q.defer();
        MailBox.findOne({"devices": idDevice}, function (err, mailBox) {
            if (mailBox == null) {
                deferred.reject({error: "MailBox not found!"});
                console.log("mailBox NULL !!!!");
            } else {
                deferred.resolve(mailBox);
                console.log("mailBox", mailBox);
            }
        });
        return deferred.promise;
    };
    this.getMailBoxByUser = function (idUser) {
        console.log("Get mailBox by idUser", idUser);
        var deferred = Q.defer();
        MailBox.findOne({"userId": idUser}, function (err, mailBox) {
            if (mailBox == null) {
                deferred.reject({error: "MailBox not found!"});
                console.log("mailBox NULL !!!!");
            } else {
                deferred.resolve(mailBox);
                console.log("mailBox", mailBox);
            }
        });
        return deferred.promise;
    };
    this.getMailBoxByNumber = function (number) {
        var deferred = Q.defer();
        console.log("Get mailBox by number", number);
        MailBox.findOne({"mailBoxNumber": number}, function (err, mailBox) {
            if (mailBox == null) {
                deferred.reject({error: "MailBox not found!"});
                console.log("mailBox NULL !!!!");
            } else {
                deferred.resolve(mailBox);
                console.log("mailBox", mailBox);
            }
        });
        return deferred.promise;
    };
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        MailBox.findByIdAndUpdate(id, body, function (err, mailBox) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(mailBox);
            }
            console.log("mailBox\n" + mailBox);
        });
        return deferred.promise;

    };
    this.updateByMailBoxname = function (mailBoxname, body) {
        var deferred = Q.defer();
        MailBox.findOneAndUpdate(mailBoxname, body, function (err, mailBox) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(mailBox);
            }
            console.log("mailBox:\t" + mailBox);
        });
        return deferred.promise;
    };
    this.deleteMailBox = function (mailBox) {
        var deferred = Q.defer();
        MailBox.remove(function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve({success: "MailBox deleted"});
            }
            console.log('MailBox deleted!');
        });
        return deferred.promise;
    };
    this.deleteByMailBoxname = function (mailBoxname) {
        var deferred = Q.defer();
        MailBox.findOneAndRemove(mailBoxname, function (err) {
            if (err) {
                console.log("error while deleting mailBox");
                deferred.reject(err);
            } else {
                deferred.resolve({success: "MailBox deleted"});
            }
            console.log('MailBox deleted!');
        });
        return deferred.promise;
    };
    this.deleteById = function (id) {
        var deferred = Q.defer();
        MailBox.findByIdAndRemove(id, function (err) {
            if (err) {
                deferred.reject({error: "error while deleting mailBox !"});
            } else {
                deferred.resolve({success: "MailBox deleted"});
            }
            console.log('MailBox deleted!');
        });
        return deferred.promise;
    };*/
    this.addMailBox = function (mailBox) {
        console.log("MailBox", mailBox);
        var newMailBox = new MailBox(mailBox);
        var deferred = Q.defer();
        newMailBox.save(function (err, data) {
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
    this.getAllMailBoxs = function () {
        var deferred = Q.defer();
        console.log("get All MailBoxs");
        MailBox.find({}, function (err, mailBoxs) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(mailBoxs);
            }
            console.log("Get All MailBoxs", mailBoxs);
        });
        return deferred.promise;
    };
    this.listMailBoxsByAccount = function (accountID) {
        var deferred = Q.defer();
        console.log({account: accountID});
        MailBox.find({account: accountID}, function (err, data) {
            if (err) {
                deferred.reject({error:"error listing mailBox by account"});
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        console.log("body", body, "account" in body);
        if (!("account" in body)) {
            MailBox.findByIdAndUpdate(id, body, function (err, mailBox) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(mailBox);
                }
            });
        } else {
            var query = {
                _id: id,
                account: body.account
            };
            console.log("query", query);
            MailBox.findOneAndUpdate(query, body, function (err, mailBox) {
                console.log(err, mailBox);
                if (user !== null) {
                    deferred.resolve(mailBox);
                } else {
                    deferred.resolve({error : "MailBox not found"});
                }
            });
        }
        return deferred.promise;
    };
    this.getMailBoxById = function (id, account) {
        console.log("Get MailBox by id");
        var deferred = Q.defer();
        MailBox.findById(id, function (err, mailBox) {
            if (err || !mailBox) {
                deferred.reject({error : "MailBox not found"});
            } else {
                if (account === undefined || account.toString() === mailBox.account.toString()) {
                    deferred.resolve(mailBox);
                } else {
                    deferred.reject({error : "MailBox not found"});
                }
            }
        });
        return deferred.promise;
    };
    this.deleteById = function (id, account) {
        var deferred = Q.defer();
        console.log("deleteById", account);
        if (account === undefined) {
            MailBox.findByIdAndRemove(id, function (err, mailBox) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(mailBox);
                }
            });
        } else {
            var query = {
                _id: id,
                account: account
            };
            console.log("query", query);
            MailBox.findOneAndRemove(query, function (err, mailBox) {
                console.log(err, mailBox);
                if (user !== null) {
                    deferred.resolve(mailBox);
                } else {
                    deferred.resolve({error : "MailBox not found"});
                }
            });
        }
        return deferred.promise;
    };
    this.getMailBoxByUser = function (user, account) {
        console.log("Get mailBox by idUser", user);
        var deferred = Q.defer();
        var query = {
            userId: user,
            account: account
        };
        MailBox.findOne(query, function (err, mailBox) {
            if (!mailBox) {
                deferred.reject({error: "MailBox not found!"});
                console.log("mailBox NULL !!!!");
            } else {
                deferred.resolve(mailBox);
                console.log("mailBox", mailBox);
            }
        });
        return deferred.promise;
    };
    this.getMailBoxBySip = function (sip) {
        var deferred = Q.defer();
        var resultInternal = devices.getInternalBySip(sip);
        resultInternal.then(function (internal) {
            var resultDevice = devices.getDeviceByInternal(internal);
            resultDevice.then(function (device) {
                if (typeof device == 'string')
                    device = JSON.parse(device);
                var idDevice = JSON.stringify(device._id);
                idDevice = idDevice.replace(/^"(.*)"$/, '$1');
                var resultUser = users.getUserByDevice(idDevice);
                resultUser.then(function (user) {
                    if (typeof user == 'string')
                        user = JSON.parse(user);
                    var idUser = JSON.stringify(user._id);
                    idUser = idUser.replace(/^"(.*)"$/, '$1');
                    var resultMailBox = self.getMailBoxByUser(idUser);
                    resultMailBox.then(function (mailbox) {
                        console.log("mailBox get by Sip", mailbox);
                        deferred.resolve(mailbox);
                    }, function (error) {
                        console.log("Error resultMailbox");
                        deferred.reject({error: "Error resultMailbox"});
                    });
                }, function (error) {
                    console.log("Error resultUser");
                    deferred.reject({error: "Error resultUser"});
                });
            }, function (error) {
                console.log("error resultDevice ::GetMailBoxBySip");
                deferred.reject({error: "error resultDevice ::GetMailBoxBySip"});
            });
        }, function (error) {
            console.log("error resultInternal");
        });
        return deferred.promise;
    };
    this.getMailBoxByNumber = function (number) {
        var deferred = Q.defer();
        console.log("Get mailBox by number", number);
        MailBox.findOne({"mailBoxNumber": number}, function (err, mailBox) {
            if (mailBox == null) {
                deferred.reject({error: "MailBox not found!"});
                console.log("mailBox NULL !!!!");
            } else {
                deferred.resolve(mailBox);
                console.log("mailBox", mailBox);
            }
        });
        return deferred.promise;
    };
};

module.exports = db;