/**
 * Created by Lucas on 30/11/15.
 */
var config = require('./config'),
    mongoose = require('mongoose');

module.exports = function() {
    var db = mongoose.connect(config.db);
    require('../users/models/userModel');
    require('../accounts/models/accountModel');
    require('../accounts/models/billSettingsModel');
    require('../accounts/models/contactModel');
    require('../itp-voice/submodules/models/deviceModel');
    require('../itp-voice/submodules/models/numberModel');
    require('../itp-voice/submodules/models/ivrModel');
    require('../itp-voice/submodules/models/getModel');
    require('../itp-voice/submodules/models/ifModel');
    require('../itp-voice/submodules/models/ringGroupModel');
    require('../itp-voice/submodules/models/menuModel');
    require('../itp-voice/submodules/models/queueModel');
    require('../itp-voice/submodules/models/mohModel');
    require('../itp-voice/submodules/models/featureCodeModel');
    require('../itp-voice/submodules/models/agentQueueModel');
    require('../itp-voice/submodules/models/callLogModel');
    require('../itp-voice/submodules/models/activeCallModel');
    require('../itp-voice/submodules/models/mailBoxModel');
    require('../itp-voice/submodules/models/messageModel');
    require('../itp-voice/submodules/models/folderModel');
    require('../itp-voice/submodules/models/recordingModel');
    require('../itp-voice/submodules/models/sbcModel');
    require('../itp-voice/submodules/models/brandProvisionerModel');
    require('../itp-fiber/models/fiberDeviceModel');
    require('../itp-fiber/models/fiberServiceModel');
    require('../itp-fiber/models/customerSubnets');
    require('../itp-fiber/models/itpSubnets');
    require('../products/invoices/models/quoteModel');
    require('../products/invoices/models/quoteCustomerInfo');
    return db;
};