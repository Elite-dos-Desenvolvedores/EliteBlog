'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const Schema = mongoose.Schema;
const oAuthTypes = ['github', 'discord'];


/**
 * User Schema
 */

const UserDiscordSchema = Schema({
  // Discord ID snowflake
  id: String,
  avatar: String,

  // Referencia do usuário
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  _id: false
})

const UserSchema = new Schema({
  name: String,
  email: String,
  username: String,
  provider: String,
  avatar: String,
  hashed_password: { type: String, select: false },
  createdAt: { type: Date, default: Date.now },
  isAdmin: {type: Boolean, default: false },
  isReporter: {type: Boolean, default: false },
  salt: { type: String },
  authToken: { type: String, default: '', select: false },
  github: {},
  discord: {
    type: UserDiscordSchema,
    default: UserDiscordSchema,
    required: false
  }
}, {
  versionKey: 0
});

const validatePresenceOf = value => value && value.length;

/**
 * Virtuals
 */

UserSchema.virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

/**
 * Validations
 */

// the below 5 validations only apply if you are signing up traditionally

UserSchema.path('name').validate(function(name) {
  if (this.skipValidation()) return true;
  return name.length;
}, 'O nome não pode ficar em branco.');

UserSchema.path('email').validate(function(email) {
  if (this.skipValidation()) return true;
  return email.length;
}, 'O e-mail não pode ficar em branco.');

UserSchema.path('email').validate(function(email) {
  return new Promise(resolve => {
    const User = mongoose.model('User');
    if (this.skipValidation()) return resolve(true);

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('email')) {
      User.find({ email }).exec((err, users) => resolve(!err && !users.length));
    } else resolve(true);
  });
}, 'O e-mail `{VALUE}` já existe.');

UserSchema.path('username').validate(function(username) {
  if (this.skipValidation()) return true;
  return username.length;
}, 'O usuário não pode ficar em branco.');

UserSchema.path('hashed_password').validate(function(hashed_password) {
  if (this.skipValidation()) return true;
  return hashed_password.length && this._password.length;
}, 'A senha não pode ficar em branco.');

/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  if (!this.isNew) return next();

  if (!validatePresenceOf(this.password) && !this.skipValidation()) {
    next(new Error('Senha incorreta.'));
  } else {
    next();
  }
});

/**
 * Methods
 */

UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function() {
    return Math.round(new Date().valueOf() * Math.random()) + '';
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function(password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      throw err
    }
  },

  /**
   * Validation is not required if using OAuth
   */

  skipValidation: function() {
    return ~oAuthTypes.indexOf(this.provider);
  }
};

/**
 * Statics
 */

UserSchema.statics = {
  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  load: function(options, cb) {
    return this.findOne(options.criteria).exec(cb);
  }
};

mongoose.model('User', UserSchema);
mongoose.model('UserDiscord', UserDiscordSchema);