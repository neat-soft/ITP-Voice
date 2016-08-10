/**
 * Created by Lucas on 30/11/15.
 */
var Menu = require('mongoose').model('Menu');
var Q = require('q');

var db = function () {
    var self = this;
    this.addMenu = function (menu) {
        console.log("addMenu From Controller\n" + menu);
        var newMenu = new Menu(menu);
        var deferred = Q.defer();
        newMenu.save(function (err, data) {
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
    this.getAllMenus = function () {
        var deferred = Q.defer();
        Menu.find({}, function (err, menus) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(menus);
            }
            console.log(menus);
        });
        return deferred.promise;
    };
    this.listMenusByAccount = function (accountID) {
        var deferred = Q.defer();
        console.log({account: accountID});
        Menu.find({account: accountID}, function (err, data) {
            if (err) {
                deferred.reject({error:"error listing users by account"});
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.deleteById = function (id, account) {
        var deferred = Q.defer();
        console.log("deleteById", account);
        if (account === undefined) {
            Menu.findByIdAndRemove(id, function (err, menu) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(menu);
                }
            });
        } else {
            var query = {
                _id: id,
                account: account
            };
            console.log("query", query);
            Menu.findOneAndRemove(query, function (err, menu) {
                console.log(err, menu);
                if (menu !== null) {
                    deferred.resolve(menu);
                } else {
                    deferred.resolve({error : "Menu not found"});
                }
            });
        }
        return deferred.promise;
    };
    this.getMenuById = function (id, account) {
        console.log("Get user by id");
        var deferred = Q.defer();
        Menu.findOne({_id: id, account: account}, function (err, menu) {
            if (err || !menu) {
                deferred.reject({error : "Menu not found"});
            } else {
                deferred.resolve(menu);
            }
        });
        return deferred.promise;
    };
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        console.log("body", body, "account" in body);
        if (!("account" in body)) {
            Menu.findByIdAndUpdate(id, body, function (err, menu) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(menu);
                }
            });
        } else {
            var query = {
                _id: id,
                account: body.account
            };
            console.log("query", query);
            Menu.findOneAndUpdate(query, body, function (err, menu) {
                console.log(err, menu);
                if (menu !== null) {
                    deferred.resolve(user);
                } else {
                    deferred.resolve({error : "Menu not found"});
                }
            });
        }
        return deferred.promise;
    };
    /*-----------------------------------------*/
    this.getMenu = function (menu) {
        var deferred = Q.defer();
        Menu.findOne({menuname: menu.menuname}, function (err, menu) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(menu);
            }
            console.log(menu);
        });
        return deferred.promise;
    };
    this.deleteMenu = function (menu) {
        var deferred = Q.defer();
        Menu.remove(function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve({success: "Menu deleted"});
            }
            console.log('Menu deleted!');
        });
        return deferred.promise;
    };
};

module.exports = db;