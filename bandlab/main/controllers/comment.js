const Post = require("../models/Post");
const Comment = require("../models/Comment");
const common = require("./common");

exports.createComment = async (req, res) => {
  try {
    const { actor, comment, postId } = req.body;
    // Create new comment
    const newComment = new Comment({
      comment: comment,
      postId: postId,
      creator: actor
    });
    const savedComment = await newComment.save();

    // Update the post's comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }, { timestamps: false });

    res.json(savedComment);
  } catch (err) {
    common.handleError(err, res);
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    // Delete the comment
    const comment = await Comment.findById(commentId)
    await comment.delete();

    // Update the post's comment count
    await Post.findByIdAndUpdate(comment.commentId, { $inc: { commentCount: -1 } }, { timestamps: false });

    res.json({});
  } catch (err) {
    common.handleError(err, res);
  }
};
