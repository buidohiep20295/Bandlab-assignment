const validator = require('../controllers/validator.js');
const postController = require('../controllers/post.js');

module.exports = app => {
  const router = require("express").Router();

  router.post("/posts", validator.validateCreatePostParams, postController.createPost);

  router.get("/posts", validator.validateGetPostsParams, postController.getPosts);

  router.post("/comments", validator.validateCreateCommentParams, controller.createComment);

  router.delete("/comments/:commentId", validator.validateUpdateCommentParams, controller.deleteComment);

  app.use("/api/v1", router);
};