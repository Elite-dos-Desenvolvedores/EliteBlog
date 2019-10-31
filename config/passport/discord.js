'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const DiscordStrategy = require('passport-discord').Strategy;
const config = require('../');
const User = mongoose.model('User');
const UserDiscord = mongoose.model('UserDiscord');

/**
 * Expose
 */

var scopes = ['identify', 'email', 'guilds', 'guilds.join'];

module.exports = new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENTID,
    clientSecret: process.env.DISCORD_SECRET,
    scope: scopes
  },
  function (accessToken, refreshToken, profile, done) {
    const discordId = profile.id

    /**
     * Se você precisar verificar algo relacionado ao Discord do usuário e não tem o ID dele
     * só do usuário, vc usa `discord.id == ?`, e obtém o `user` que tá aqui
     */

    /**
     * Verifica se existe o ID do discord
     */
    User.findOne({ 'discord.id': discordId }, function (err, res) {
      if (res !== null) {
        return done(err, res)
      }
    });

    const options = {
      criteria: {
        'discord.id': discordId
      }
    };
    User.load(options, function (err, user) {
      if (err) return done(err);
      if (!user) {
        user = new User({
          id: profile.id,
          avatar: profile.avatar,
          name: profile.username,
          email: profile.email,
          username: profile.username,
          discriminator: profile.discriminator,
          provider: 'discord'
        });

        user.discord = new UserDiscord({
          id: discordId,
          user: user._id
        });
        user.save(function (err) {
          if (err) console.log(err);
          return done(err, user);
        });
      } else {
        return done(err, user);
      }
    });
  }
);