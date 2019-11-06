'use strict';

/**
 * Module dependencies.
 */

const { wrap: async } = require('co');

/**
 * Load comment
 */

exports.load = function(req, res, next, id) {
  req.comment = req.article.comments.find(comment => comment.id === id).populate('user').exec();

  if (!req.comment) return next(new Error('Comentário não encontrado.'));
  next();
};

/**
 * Create comment
 */

exports.create = async(function*(req, res) {
  const article = req.article;
  yield article.addComment(req.user, req.body);
  res.redirect(`/articles/${article.clean_title}`);
});

/**
 * Delete comment
 */

exports.destroy = async(function*(req, res) {
  yield req.article.removeComment(req.params.commentId);
  req.flash('info', 'Comentário deletado com sucesso!');
  res.redirect(`/articles/${req.article.clean_title}`);
});
