/**
 * Created by Lucas on 22/12/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FolderSchema = new Schema({
    name:  {
        type: String
    },
    recording: { type : String},
    dtmf_folder: {type: String}

});

mongoose.model('Folder', FolderSchema);