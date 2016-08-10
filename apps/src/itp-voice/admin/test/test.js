/**
 * Created by teliteck on 10/08/15.
 */

var number = require("./../controllers/number.js");
var ObjectId = require('mongodb').ObjectID;

number.getNumberByExtension("1234")
    .then(function(data){
        console.log(data);
    }, function(err){
        console.log("error: number not found!!");
        console.log(err);
    });

