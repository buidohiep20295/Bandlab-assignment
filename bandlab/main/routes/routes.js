const post = require('../controllers/post.js');
const comment = require('../controllers/comment.js');
const image = require('../controllers/image.js');

/**
 * To keep it simple, we don't give the implementation details about the authentication process
 * Normally we could have a middleware for authentication, either using cookie session or jwt
 * 
 * For the scope of this project, we simple pass in the actor as the user id in the payload
 */
module.exports = app => {
  const router = require("express").Router();

  router.post("/posts", post.validateCreatePostParams, post.createPost);

  router.get("/posts", post.validateGetPostsParams, post.getPosts);

  router.post("/comments", comment.validateCreateCommentParams, comment.createComment);

  router.delete("/comments/:commentId", comment.validateDeleteCommentParams, comment.deleteComment);

  router.post("/images", image.uploadImage);

  app.use("/api/v1", router);
}