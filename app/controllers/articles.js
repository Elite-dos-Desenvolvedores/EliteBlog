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

/**
 * Load
 */
exports.load = async (function* (req, res, next, param) {
  try {
    var by;
    if (isObjectId(param))
      by = {
        _id: param
      }
    else
      by = {
        clean_title: param
      }
    req.article = yield Article.findOne(by).populate('user').exec()
    if (!req.article) return next(new Error('O post não foi encontrado'));
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * List
 */

exports.index = async (function* (req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 2;
  const options = {
    limit: limit,
    page: page
  };

  if (_id) options.criteria = {
    _id
  };

  const articles = yield Article.list(options);
  const count = yield Article.countDocuments();

  res.render('articles/index', {
    title: 'Postagens',
    articles: articles,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

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

const retrieveImage = async (function* (image, cb) {
  if (!image)
    return null

  ImageService.getFile(process.env.IMAGER_S3_BUCKET, image.id, function (err) {
    if (err)
      throw err;

    cb(ImageService.s3.endpoint.href + process.env.IMAGER_S3_BUCKET + "/" + image.id)
  });
});

/**
 * Show
 */
exports.show = async (function* (req, res) {
  const user = req.user
  retrieveImage(req.article.image, function (imageHref) {
    res.render('articles/show', {
      title: req.article.title,
      article: req.article,
      imageHref: imageHref,
      user: user
    });
  });
});

/**
 * Delete an article
 */

exports.destroy = async (function* (req, res) {
  yield req.article.remove();
  req.flash('info', 'Post deletado com sucesso!');
  res.redirect('/articles');
});