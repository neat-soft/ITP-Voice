var Users = require('./src/users/controllers/userController');
var users = new Users();
var accountController = require('./src/accounts/controllers/accountController');
var accountController = new accountController();
var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com',apiKey: 'asdasjsdgfjkjhg' }
    , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com',apiKey: 'gfsdgsfgsfg' }
];

module.exports = {
    user: {
        updateOrCreate: function(user, cb) {
            cb(null, user);
        },
        authenticate: function(apiKey, cb) {
            console.log("MiddleWare :",apiKey);
            accountController.getAccountByApiKey(apiKey)
            .then(function (account) {
                    console.log("account  ",account);
                    if (account.length != 0){
                        return cb(null, account);
                    } else {
                        return cb(null, null);
                    }
                }, function (error) {
                    console.log(error);
                });
        }
    },
    client: {
        clients: [],
        clientCount: 0,
        updateOrCreate: function(data, cb) {
            var id = this.clientCount++;
            this.clients[id] = {
                id: id,
                userId: data.user.id
            };
            cb(null, {
                id: id
            });
        },
        storeToken: function(data, cb) {
            this.clients[data.id].refreshToken = data.refreshToken;
            cb();
        },
        findUserOfToken: function(data, cb) {
            if(!data.refreshToken){
                return cb(new Error('invalid token'));
            }
            for (var i = 0; i < this.clients.length; i++) {
                if (this.clients[i].refreshToken === data.refreshToken) {
                    return cb(null, {
                        id: this.clients[i].userId,
                        clientId: this.clients[i].id
                    });
                }
            }
            cb(new Error('not found'));
        },
        rejectToken: function(data, cb){
            for (var i = 0; i < this.clients.length; i++) {
                if (this.clients[i].refreshToken === data.refreshToken) {
                    this.clients[i] = {};
                    return cb();
                }
            }
            cb(new Error('not found'));
        }
    }
};