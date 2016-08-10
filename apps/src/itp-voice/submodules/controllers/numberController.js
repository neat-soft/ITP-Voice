/**
 * Created by Lucas on 30/11/15.
 */
var Number = require('mongoose').model('Number');
var Vitelity = require('./vitelityController');
var Q = require('q');

var vitelity = new Vitelity();

var db = function () {
    var self = this;
    this.getExternalNumbers = function (num, device) {
        var deferred = Q.defer();
        if (device.match_area) {
            var query = {
                number: RegExp(num.subString(0, 3)),
                account: device.account
            };
        } else if (device.use_caller_id) {
            var query = {
                use_caller_id: true,
                account: device.account
            };
        }
        Number.find(query, function (err, numbers) {
            console.log("Numbers: ", numbers);
            if (err || numbers.length === 0) {
                // TODO: should use main company number ?
                deferred.resolve([]);
            } else {
                deferred.resolve(numbers);
            }
        });
        return deferred.promise;
    };
    this.addExtention = function (body) {
        var deferred = Q.defer();
        var newNumber = new Number(body);
        newNumber.save(function (error, data) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.addLocalNumber = function (body) {
        var deferred = Q.defer();
        var json = {npanxx: body.number.substring(0,6)};
        vitelity.searchByNPANXX(json)
            .then(function(localNumber) {
                var did = localNumber.content.numbers.did;
                if(Object.prototype.toString.call(did) === "[object Array]")
                    did = did[0];
                console.log("local number: ", did);
                body.ratecenter = did.ratecenter;
                body.state = did.state;
                body.npa = body.number.substring(0,3);
                body.nxx = body.number.substring(3,6);
                console.log("Number: ", body);
                var json = {did: body.number};
                vitelity.orderLocalNumber(json)
                    .then(function (DID) {
                        var newNumber = new Number(body);
                        newNumber.save(function (error, data) {
                            if (error) {
                                console.log(error);
                                deferred.reject(error);
                            } else {
                                console.log(data);
                                deferred.resolve(data);
                            }
                        });
                    }, function (error) {
                        deferred.reject(error);
                    });
            }, function(err){
                deferred.reject({"error": "error to load information about this number"});
            });
        return deferred.promise;
    };
    this.addTollFree = function (body) {
        console.log("add number From Controller",  body);
        var deferred = Q.defer();
        var json = {did: body.number};
        vitelity.orderTollFreeNumber(json)
            .then(function (DID) {
                var newNumber = new Number(body);
                newNumber.save(function (error, data) {
                    if (error) {
                        console.log(error);
                        deferred.reject(error);
                    } else {
                        console.log(data);
                        deferred.resolve(data);
                    }
                });
            }, function (error) {
                deferred.reject(error);
            });
        return deferred.promise;
    };
    this.linkNumber = function (body) {
        console.log("add number From Controller" + body);
        var deferred = Q.defer();
        var json = {did: body.number};
        var newNumber = new Number(body);
        newNumber.save(function (error, data) {
            if (error) {
                console.log(error);
                deferred.reject(error);
            } else {
                console.log(data);
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.unlinkNumber = function (body, check) {
        var deferred = Q.defer();
        if (check) {
            var json = {number: body.number, account: body.account};
            Number.findOne(json, function (error, number) {
                console.log(error, number);
                if (error) {
                    deferred.reject(error);
                } else if (!number) {
                    deferred.reject({"status":"nok","response":"you can't delete this number"});
                } else {
                    var json = {did: body.number};
                    Number.findOneAndRemove({number: body.number}, function (error) {
                        if (error) {
                            deferred.reject(error);
                        } else {
                            deferred.resolve({success : "Number deleted"});
                        }
                    });
                }
            });
        } else {
            var json = {number: body.number};
            Number.findOneAndRemove({number: body.number}, function (error) {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve({success : "Number deleted"});
                }
            });
        }
        return deferred.promise;
    };
    this.deleteNumber = function (body, check) {
        var deferred = Q.defer();
        if (check) {
            var json = {number: body.number, account: body.account};
            Number.findOne(json, function (error, number) {
                console.log(error, number);
                if (error) {
                    deferred.reject(error);
                } else if (!number) {
                    deferred.reject({"status":"nok","response":"you can't delete this number"});
                } else {
                    var json = {did: body.number};
                    vitelity.removeNumber(json).then(function (DID) {
                        Number.findOneAndRemove({number: body.number}, function (error) {
                            if (error) {
                                deferred.reject(error);
                            } else {
                                deferred.resolve({success : "Number deleted"});
                            }
                        });
                    }, function (error) {
                        deferred.reject(error);
                    });
                }
            });
        } else {
            var json = {did: body.number};
            vitelity.removeNumber(json).then(function (DID) {
                Number.findOneAndRemove({number: body.number}, function (error) {
                    if (error) {
                        deferred.reject(error);
                    } else {
                        deferred.resolve({success : "Number deleted"});
                    }
                });
            }, function (error) {
                deferred.reject(error);
            });
        }
        return deferred.promise;
    };
    this.listNumbersByAccount = function (accountID) {
        var deferred = Q.defer();
        console.log({account: accountID});
        Number.find({account: accountID}, function (err, data) {
            if (err) {
                deferred.reject({error:"error listing users by account"});
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.getAllNumbers = function () {
        var deferred = Q.defer();
        Number.find({}, function (err, numbers) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(numbers);
            }
        });
        return deferred.promise;
    };
    this.checkIfExists = function (number, account) {
        var deferred = Q.defer();
        Number.find({number: number, account: account}, function (err, numbers) {
            if (numbers.length == 0) {
                deferred.resolve(false);
            } else {
                deferred.resolve(true);
            }
        });
        return deferred.promise;
    };
    this.getNumber = function (number, account) {
        console.log("inside getNumber");
        var deferred = Q.defer();
        Number.findOne({number: number, account: account}, function (err, newnumber) {
            console.log("newnumber: ", newnumber);
            console.log("err: ", err);
            if (newnumber == null || newnumber === undefined) {
                deferred.reject({error: "Number not found!"});
            } else {
                deferred.resolve(newnumber);
            }
        });
        return deferred.promise;
    };
    this.getNumberById = function (id) {
        var deferred = Q.defer();
        Number.findById(id, function (err, number) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(number);
            }
        });
        return deferred.promise;
    };
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        Number.findByIdAndUpdate(id, body, function (err, number) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(number);
            }
        });
        return deferred.promise;
    };
    this.updateByNumber = function (numbername, body) {
        var deferred = Q.defer();
        Number.findOneAndUpdate(numbername, body, function (err, number) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(number);
            }
        });
        return deferred.promise;
    };
    this.deleteByNumber = function (numbername) {
        var deferred = Q.defer();
        Number.findOneAndRemove({numbername: numbername}, function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve({success : "Number deleted"});
            }
        });
        return deferred.promise;
    };
    this.deleteById = function (id) {
        var deferred = Q.defer();
        Number.findByIdAndRemove(id, function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve({success : "Number deleted"});
            }
        });
        return deferred.promise;
    };
};

module.exports = db;