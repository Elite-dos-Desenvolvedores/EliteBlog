'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const {
  wrap: async
} = require('co');
const only = require('only');
const Article = mongoose.model('Article');
const assign = Object.assign;
const ImageService = require('../../config/pkgcloud');
const {
  isObjectId
} = require('../utils');
const Like = mongoose.model('Like');

/**
 * Load
 */
exports.load = async (function* (req, res, next, param) {
  try {
    var options = {};
    if (isObjectId(param))
      options._id = param;
    else
      options.clean_title = param;

    const article = yield Article.findOne(options).populate('user').populate('comments.user').then(async result => {
      result.likes = await Like.find({ article: result._id })
      result.hasLiked = result.likes.find(like => like.user._id.equals(req.user._id)) ? true : false
      return Promise.resolve(result);
    });
    if (!article)
      return next(new Error('O post não foi encontrado'));
    req.article = article;
  } catch (err) {
    return next(err);
  }
  next();
});

async function listBy(options = {}, page = 1, limit = 30) {
  return Article.find(options, null, {
    'sort': {
      'createdAt': -1
    },
  }).skip(page * limit).limit(limit).exec().then(async articles => {
    return await Promise.all(articles.map(async (article) => {
      return await retrieveImage(article.image.id).then(href => {
        article.imageHref = href;
        return Promise.resolve(article);
      }).catch(err => {
        throw err;
      });
    }));
  })
}

exports.listBy = listBy;

/**
 * List
 */
exports.index = async function (req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const count = await Article.countDocuments();
  const limit = 10;
  listBy({}, page, limit).then(articles => {
    res.render('articles/index', {
      title: 'Postagens',
      allArticles: articles,
      page: page + 1,
      pages: Math.ceil(count / limit)
    });
  });
};

/**
 * New article
 */

exports.new = function (req, res) {
  res.render('articles/new', {
    title: 'Novo post',
    article: new Article()
  });
};

/**
 * Create an article
 */

exports.create = async (function* (req, res) {
  const article = new Article(only(req.body, 'title image body tags'));
  try {
    article.user = req.user;
    article.uploadAndSave(req.file, function () {
      req.flash('success', `Post ${article.title} criado com sucesso!`);
      res.redirect(`/articles/${article.clean_title}`);
    });
  } catch (err) {
    throw err
  }
});

/**
 * Edit an article
 */

exports.edit = function (req, res) {
  res.render('articles/edit', {
    title: 'Editar ' + req.article.title,
    article: req.article
  });
};

/**
 * Update article
 */

exports.update = async (function* (req, res) {
  const article = req.article;
  assign(article, only(req.body, 'title body tags'));
  try {
    article.uploadAndSave(req.file, function () {
      res.redirect(`/articles/${article.clean_title}`);
    });
  } catch (err) {
    res.status(422).render('articles/edit', {
      title: 'Editar ' + article.title,
      errors: [err.toString()],
      article
    });
  }
});

/**
 * Show
 */
exports.show = function (req, res) {
  const user = req.user
  var article = req.article;
  console.log("Article", article);
  retrieveImage(article.image.id).then(href => {
    article.imageHref = href;
    res.render('articles/show', {
      article,
      user
    });
  });
};

/**
 * Like
 */
exports.like = function (req, res) {
  var liked = req.article.likes.find(like => like.user._id.equals(req.user._id));
  if (!liked) {
    const like = new Like();
    like.user = req.user._id;
    like.article = req.article._id;
    like.save().then((liked) => {
      req.article.likes.push(liked._id);
      res.status(201).json({ alreadyLiked: false });
    })
  } else {
    Like.deleteOne({ _id: liked._id }).then(() => {
      res.status(200).json({ alreadyLiked: true });
    });
  }
};

/**
 * Delete an article
 */

exports.destroy = async (function* (req, res) {
  yield req.article.remove();
  req.flash('info', 'Post deletado com sucesso!');
  res.redirect('/articles');
});

async function retrieveImage(imageId) {
  return new Promise((resolve, reject) => {
    ImageService.getFile(process.env.IMAGER_S3_BUCKET, imageId, function (err) {
      if (err)
        return reject(err);

      return resolve(ImageService.s3.endpoint.href + process.env.IMAGER_S3_BUCKET + "/" + imageId);
    });
  });
}

exports.retrieveImage = retrieveImage;