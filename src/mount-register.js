'use strict';
const createController = require('./register-controller');
const registerLimit = require('./rate-limit');
module.exports = function mountRegister(app, pool) {
  app.post('/api/auth/register', registerLimit(), createController({ pool, bcrypt: require('bcrypt') }));
};
