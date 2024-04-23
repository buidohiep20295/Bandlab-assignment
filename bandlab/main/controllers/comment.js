const Post = require("../models/Post");
const Comment = require("../models/Comment");
const common = require("./common");
const ObjectId = require("mongoose").Types.ObjectId;

exports.validateCreateCommentParams = async (req, res, next) => {
  const { postId } = req.body;
  const post = await Post.findById(postId);

  if (!post) {
    return res.status(400).json({message: "Post not found"});
  }
  next();
}

exports.createComment = async (req, res) => {
  try {
    const { actor, comment, postId } = req.body;
    // Create new comment
    const newComment = new Comment({
      comment: comment,
      postId: new ObjectId(postId),
      creator: new ObjectId(actor)
    });
    const savedComment = await newComment.save();

    // Update the post's comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }, { timestamps: false });

    res.json(savedComment);
  } catch (err) {
    common.handleError(err, res);
  }
};

exports.validateDeleteCommentParams = async (req, res, next) => {
  const { commentId } = req.params;
  const { actor } = req.body;
  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(400).json({message: "Comment not found"});
  }
  if (comment.creator.toString() != actor) {
    return res.status(403).json({message: "You can only delete comments created by yourself"});
  }
  next();
}

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    // Delete the comment
    const comment = await Comment.findById(commentId);

    await Comment.findByIdAndDelete(commentId);

    // Update the post's comment count
    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } }, { timestamps: false });

    res.json({});
  } catch (err) {
    common.handleError(err, res);
  }
}