const Image = require('../models/Image');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.validateGetPostsParams = async (req, res, next) => {
  const { prevPostId } = req.body;

  if (prevPostId != "") {
    const post = await Post.findById(prevPostId);
    if (!post) {
      return res.status(400).json({message: "Previous post not found"});
    }
  }
  next();
};

exports.validateCreatePostParams = async (req, res, next) => {
  const { actor, imageId } = req.body;
  const image = await Image.findById(imageId);

  if (!image) {
    return res.status(400).json({message: "Image not found"});
  }
  if (image.creator.toString() != actor) {
    return res.status(400).json({message: "You can only create posts with photos uploaded by yourself"});
  }
  next();
};


exports.validateCreateCommentParams = async (req, res, next) => {
  const { postId } = req.body;
  const post = await Post.findById(postId);

  if (!post) {
    return res.status(400).json({message: "Post not found"});
  }
  next();
};

exports.validateUpdateCommentParams = async (req, res, next) => {
  const { commentId } = req.params;
  const { actor } = req.body;
  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(400).json({message: "Comment not found"});
  }
  if (comment.creator.toString() != actor) {
    return res.status(400).json({message: "You can only update comments created by yourself"});
  }
  next();
};
