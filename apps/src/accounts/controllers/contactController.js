/**
 * Created by Lucas on 15/07/16.
 */
var Contact = require('mongoose').model('Contact');
var Q = require('q');
var uuid = require('uuid');

var db = function () {
    var self = this;
    this.addContact = function (contact) {
        var deferred = Q.defer();
        var newContact = new Contact(contact);
        newContact.save(function (err, data) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.getAllContact = function (contactID) {
        var deferred = Q.defer();
        var query = {};
        if(contactID)
            query= {account: contactID};
        Contact.find(query, function (err, accounts) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(accounts);
            }
        });
        return deferred.promise;
    };
    this.getContactById = function (contactID, accountID, check) {
        var deferred = Q.defer();
        Contact.findById(contactID, function (err, contact) {
            if (err) {
                deferred.reject(err);
            } else {
                if(!check) {
                    if(contact)
                        if (contact.account.toString() === accountID.toString())
                            deferred.resolve(contact);
                        else
                            deferred.reject({error: "permission denied"});
                    else
                        deferred.reject({error: "permission denied"});
                }
                else {
                    if(contact)
                        deferred.resolve(contact);
                    else
                        deferred.reject({error: "Contact not found"});
                }
            }
        });
        return deferred.promise;
    };
    this.updateContact = function (contactID, body) {
        var deferred = Q.defer();
        Contact.findByIdAndUpdate(contactID, body, function (err, contact) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(contact);
            }
        });
        return deferred.promise;
    };
    this.deleteContact = function (contactID, accountID, check) {
        var deferred = Q.defer();
        if(check){
            Contact.findByIdAndRemove(contactID,function (err, result) {
                if (err) {
                    deferred.reject({error : "Contact not found"});
                } else {
                    deferred.resolve({success : "Contact deleted"});
                }
            });
        }else {
            this.getContactById(contactID, accountID, check)
                .then(function(contact){
                    Contact.findByIdAndRemove(contactID,function (err) {
                        if (err) {
                            deferred.reject({error : "Contact not found"});
                        } else {
                            deferred.resolve({success : "Contact deleted"});
                        }
                    });
                }, function(err){
                    deferred.reject(err);
                });
        }
        return deferred.promise;
    };
};
module.exports = db;
