'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const {
  wrap: async
} = require('co');
const User = mongoose.model('User');
const UserDiscord = mongoose.model('UserDiscord');
const { isObjectId } = require('../utils');

function isUINT(v) {
  if (v.length < 16)
    return false;

  var r = RegExp(/(^[^\-]{0,1})?(^[\d]*)$/);
  return r.test(v);
}

function checkCriteria(criteria, cb) {
  var params;
  if (isObjectId(criteria))
    params = { "_id": criteria }
  else if (isUINT(criteria))
    params = { "discord.id": criteria }
  else
    params = { "username": criteria }

  return User.findOne(params).exec(cb)
}

/**
 * Load
 */
exports.load = async (function* (req, res, next, who) {
  try {
    let user = yield checkCriteria(who)
    if (user)
      req.profile = user
    else
      return next(new Error('Usuário não encontrado.'));
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * Create user
 */

exports.create = async (function* (req, res) {
  const user = new User(req.body);
  user.provider = 'local';
  try {
    yield user.save();

    req.logIn(user, err => {
      if (err) req.flash('info', 'Desculpe, não foi possível fazer login, tente de novo em breve!');
      res.redirect('/');
    });
  } catch (err) {
    const errors = Object.keys(err.errors).map(
      field => err.errors[field].message
    );

    res.render('users/signup', {
      title: 'Registrar',
      errors,
      user
    });
  }
});

/**
 *  Show profile
 */

exports.show = function (req, res) {
  const user = req.profile;
  res.render('users/show', {
    title: user.name,
    user: user
  });
};

exports.signin = function () {};

/**
 * Auth callback
 */

exports.authCallback = function (req, res) {
  res.redirect('/');
};

/**
 * Show login form
 */

exports.login = function (req, res) {
  res.render('users/login', {
    title: 'Login'
  });
};

/**
 * Show sign up form
 */
exports.signup = function (req, res) {
  res.render('users/signup', {
    title: 'Registrar',
    user: new User()
  });
};

/**
 * Logout
 */

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/login');
};

/**
 * Session
 */

exports.session = login;

/**
 * Login
 */

function login(req, res) {
  const redirectTo = req.session.returnTo ? req.session.returnTo : '/';
  delete req.session.returnTo;
  res.redirect(redirectTo);
}