'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const {
  wrap: async
} = require('co');
const Article = mongoose.model('Article');
const articleService = require('./articles');

/**
 * List items tagged with a tag
 */

exports.index = async (function* (req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const count = yield Article.countDocuments();
  const limit = 25;
  articleService.listBy({ tags: req.params.tag }, page, limit).then(articles => {
    // ele volta pra index, sóp q mstrando as q tem as tags? ele ia pra /tags/algumatag e só mostrava as que tinham "algumatag"
    res.render('articles/tags', {
      title: 'Tag "' + req.params.tag + '"',
      allArticles: articles,
      page: page + 1,
      pages: Math.ceil(count / limit)
    });
  });
});


exports.load = function (req, res, next, tags) {
  Article.find({}).toArray(function (err, tags) {
    if (err) {
      res.send(err);
    } else if (tags.length) {
      res.render('widget', {
        'tagList': tags[0].data,
      });
    } else {
      res.send('Nenhuma tag encontrada');
    }
    db.close();
  });
};