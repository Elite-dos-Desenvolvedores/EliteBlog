'use strict';

/*!
 * Module dependencies.
 */

const mongoose = require('mongoose');
const User = mongoose.model('User');
const UserDiscord = mongoose.model('UserDiscord');

const local = require('./passport/local');
const discord = require('./passport/discord');
const github = require('./passport/github');

/**
 * Expose
 */

module.exports = function(passport) {
  // serialize sessions
  passport.serializeUser((user, cb) => cb(null, user.id));
  passport.deserializeUser((id, cb) =>
    User.load({ criteria: { _id: id } }, cb)
  );

  // use these strategies
  passport.use(local);
  passport.use(discord);
  passport.use(github);
};
