var express = require('express'),
    app = express(),
    mongoose = require('./src/config/mongoose'),
    db = mongoose(),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    admin = require('./src/itp-voice/admin/routes/admin_route'),
    user = require('./src/users/routes/user/routes'),
    account = require('./src/accounts/routes/account/routes'),
    billSetting = require('./src/accounts/routes/billSettings/routes'),
    contact = require('./src/accounts/routes/contact/routes'),
    device = require('./src/itp-voice/submodules/routes/device/routes'),
    get = require('./src/itp-voice/submodules/routes/get/routes'),
    ifRoute = require('./src/itp-voice/submodules/routes/if/routes'),
    number = require('./src/itp-voice/submodules/routes/number/routes'),
    ivr = require('./src/itp-voice/submodules/routes/ivr/routes'),
    ringGroup = require('./src/itp-voice/submodules/routes/ringGroup/routes'),
    menu = require('./src/itp-voice/submodules/routes/menu/routes'),
    moh = require('./src/itp-voice/submodules/routes/moh/routes'),
    queue = require('./src/itp-voice/submodules/routes/queue/routes'),
    recording = require('./src/itp-voice/submodules/routes/recording/routes'),
    featureCode = require('./src/itp-voice/submodules/routes/featureCode/routes'),
    agentQueue = require('./src/itp-voice/submodules/routes/agentQueue/routes'),
    callLog = require('./src/itp-voice/submodules/routes/callLog/routes'),
    activeCall = require('./src/itp-voice/submodules/routes/activeCall/routes'),
    mailBox = require('./src/itp-voice/submodules/routes/mailBox/routes'),
    message = require('./src/itp-voice/submodules/routes/message/routes'),
    sbc = require('./src/itp-voice/submodules/routes/sbc/routes'),
    brandProvisioner = require('./src/itp-voice/submodules/routes/brandProvisioner/routes'),
    vitelity = require('./src/itp-voice/submodules/routes/vitelity/routes'),
    itpFiberService = require('./src/itp-fiber/routes/services/routes'),
    itpFiberDevice = require('./src/itp-fiber/routes/devices/routes'),
    itpSubnet = require('./src/itp-fiber/routes/itpSubnets/routes'),
    customerSubnet = require('./src/itp-fiber/routes/customerSubnets/routes'),
    quote = require('./src/products/invoices/routes/quotes/routes'),
    AccountController = require('./src/accounts/controllers/accountController');

var accountController = new AccountController();
var passport = require('passport');
var middleware = require('./middleware');
var LocalStrategy = require('passport-localapikey').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    done(null, id);
});

passport.use(new LocalStrategy(
    function (apikey, done) {
        console.log("strategy");
        middleware.user.authenticate(apikey, function (err, account) {
            console.log("authenticating", account);
            if (err) {
                return done(err);
            }
            if (!account) {
                return done(null, false, {message: 'Unknown apikey : ' + apikey});
            }
            return done(null, account);
        });
    }
));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, content-type, Access-Control-Allow-Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
    if ('OPTIONS' == req.method) {
        return res.sendStatus(204);
    } else {
        next();
    }
});

/*app.use(passport.initialize(),
 passport.authenticate('localapikey', {session: false, scope: []}),
 function(req, res, next) {
 console.log("req  ",req.user);
 console.log("req  ",req.user[0].role);
 next();
 });*/

var exempt_urls = ["/admin/login", "/ivr/getIvrByNumber", "/admin/getResourceByNumber", "/queue/addUserToQ/", "/queue/getQueueById", "/moh/", "/admin/getAllQueuesOfAgent"];
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/accounts/:filter/queue', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    queue);

app.use('/accounts/:filter/featureCode', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    featureCode);

app.use('/accounts/:filter/number', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    number);

app.use('/accounts/:filter/user', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    user);

app.use('/accounts/:filter/ivr', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    ivr);

app.use('/accounts/:filter/device', function (req, res, next) {
        console.log("in device");
        var filter = req.params.filter;
        console.log("Filter: ", filter);
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    device);

app.use('/accounts/:filter/ring-group', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    ringGroup);

app.use('/accounts/:filter/menu', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    menu);

app.use('/accounts/:filter/recording', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    recording);

app.use('/accounts/:filter/mail-box', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    mailBox);

app.use('/accounts/:filter/moh', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    moh);

app.use('/accounts/:filter/callLog', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    callLog);

app.use('/accounts/:filter/bill-settings', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    billSetting);

app.use('/accounts/:filter/contact', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    contact);

app.use('/accounts/:filter/get', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    get);

app.use('/accounts/:filter/if', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    ifRoute);

app.use('/accounts/:filter/api', function (req, res, next) {
    var filter = req.params.filter;
    console.log("Filter admin: ", filter);
    accountController.getAccount(filter)
        .then(function (account) {
            req.account = account._id;
            next();
        }, function (err) {
            console.log("err get account form app.js", err)
        });
}, admin);

//////////////////////////////////////
app.use('/accounts/:filter/agentQueue', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    agentQueue);

app.use('/accounts/:filter/message', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    message);

app.use('/accounts/:filter/brand-provisioner', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    brandProvisioner);

app.use('/accounts/:filter/active-call', function (req, res, next) {
        console.log("in Active call");
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    activeCall);

app.use('/accounts/:filter/provision-numbers', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    vitelity);

app.use('/accounts/:filter/sbc', function (req, res, next) {
        var filter = req.params.filter;
        accountController.getAccount(filter)
            .then(function (account) {
                req.account = account._id;
                next();
            }, function (err) {
                console.log("err get account form app.js", err)
            });
    },
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    sbc);


app.use('/accounts',
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    account);


app.use('/itpFiber/ipManagement/itpSubnets',
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    itpSubnet);
app.use('/itpFiber/ipManagement/customerSubnets',
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    customerSubnet);
app.use('/itpFiber/services',
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    itpFiberService);
app.use('/itpFiber/devices',
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    itpFiberDevice);
app.use('/products/invoices',
    passport.initialize(),
    passport.authenticate('localapikey', {session: false, scope: []}),
    quote);

app.use(function (err, req, res, next) {
    res.send("error communicating with the server, please contact administrator");
});

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/api/unauthorized')
}

module.exports = app;
