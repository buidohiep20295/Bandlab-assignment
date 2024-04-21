const validator = require('../controllers/validator.js');
const controller = require('../controllers/controller.js');

module.exports = app => {
  const router = require("express").Router();

  router.post("/posts", validator.validateCreatePostParams, controller.createPost);

  router.post("/comments", validator.validateCreateCommentParams, controller.createComment);

  router.delete("/comments/:commentId", validator.validateUpdateCommentParams, controller.deleteComment);

  app.use("/api/v1", router);
};