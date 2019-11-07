'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Like Schema
 */
const LikeSchema = new Schema({
  article: {
    type: Schema.ObjectId,
    ref: 'Article',
    required: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Like', LikeSchema);