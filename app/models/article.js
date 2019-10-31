'use strict';

const REGEX = /[^a-zA-Z\d\s:@^]|[\s*]/g;

/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const notify = require('../mailer');
const snowflake = require('../../snowflake');

const ImageService = require('../../config/pkgcloud');
const Schema = mongoose.Schema;
const AttachmentSchema = require('./attachment');
const Streamifier = require('streamifier');

const getTags = tags => tags.join(',');
const setTags = tags => tags.split(',').slice(0, 10); // max tags

/**
 * Article Schema
 */
const ArticleSchema = new Schema({
  title: {
    type: String,
    default: '',
    trim: true,
    maxlength: 200
  },
  clean_title: {
    type: String,
    required: false
  },
  body: {
    type: String,
    default: '',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  comments: [{
    body: {
      type: String,
      default: '',
      maxlength: 1000
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: {
    type: [],
    get: getTags,
    set: setTags
  },
  image: {
    type: AttachmentSchema,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Validations
 */

ArticleSchema.path('title').required(true, 'O título da postagem não pode estar em branco.');
ArticleSchema.path('body').required(true, 'O texto da postagem não pode estar em branco.');

/**
 * Pre-remove hook
 */

ArticleSchema.pre('remove', function (next) {
  // const imager = new Imager(imagerConfig, 'local');
  // const files = this.image.files;

  // if there are files associated with the item, remove from the cloud too
  // imager.remove(files, function (err) {
  //   if (err) return next(err);
  // }, 'article');

  next();
});

/**
 * Methods
 */

ArticleSchema.methods = {
  /**
   * Save article and upload image
   *
   * @param {Object} image
   * @api private
   */
  uploadAndSave: function (image, cb = null) {
    const fn = () => {
      const replacement = this.title.replace(REGEX, "-")
      if (replacement)
        this.clean_title = replacement.toLowerCase();
      else
        this.clean_title = this.title;

      this.save();
      if (cb != null)
        cb()
    };
    if (image) {
      const imageId = snowflake.gen();
      const imageMime = image.mimetype.split("/");
      const imageExtension = imageMime[1];
      const rs = Streamifier.createReadStream(image.buffer)
      const ws = ImageService.upload({
        queueSize: 1,
        remote: imageId + "." + imageExtension,
        partSize: 5 * 1024 * 1024,
        container: process.env.IMAGER_S3_BUCKET,
      });

      const that = this;
      rs.pipe(ws).on('success', function(file) {
        that.image = {
          id: file.name,
          type: imageMime[0],
          extension: imageExtension,
          createdAt: +Date.now()
        }
        fn();
      }).on('error', function (err) {
        console.error(err);
        throw err;
      });
    } else fn();
  },

  /**
   * Add comment
   *
   * @param {User} user
   * @param {Object} comment
   * @api private
   */

  addComment: function (user, comment) {
    this.comments.push({
      body: comment.body,
      user: user._id
    });

    if (!this.user.email) this.user.email = 'email@product.com';

    notify.comment({
      article: this,
      currentUser: user,
      comment: comment.body
    });

    return this.save();
  },

  /**
   * Remove comment
   *
   * @param {commentId} String
   * @api private
   */

  removeComment: function (commentId) {
    const index = this.comments.map(comment => comment.id).indexOf(commentId);

    if (~index) this.comments.splice(index, 1);
    else throw new Error('Comentário não encontrado');
    return this.save();
  }
};

/**
 * Statics
 */

ArticleSchema.statics = {
  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function (_id) {
    return this.findOne({
        _id
      })
      .populate('user', 'name email username')
      .populate('comments.user')
      .exec();
  },

  /**
   * List articles
   * 
   * @param {Object} options
   * @api private
   */

  list: function (options) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const limit = options.limit || 30;
    return this.find(criteria)
      .populate('user', 'name email username')
      .sort({
        createdAt: -1
      })
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};

mongoose.model('Article', ArticleSchema);