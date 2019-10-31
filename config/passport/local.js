'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const User = mongoose.model('User');

/**
 * Expose
 */

module.exports = new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    const options = {
      criteria: { username: username },
      select: 'name username email hashed_password salt'
    };
    User.load(options, function(err, user) {
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: 'Usuário não encontrado.' });
      }
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'Senha invalida.' });
      }
      return done(null, user);
    });
  }
);
