const Post = require("../models/Post");
const Comment = require("../models/Comment");

const DEFAULT_PAGE_SIZE = 10; // Define the number of posts per page
const MAX_PAGE_SIZE = 100; // Maximum number of the posts per page

exports.createPost = async (req, res) => {
  const { imageId, actor, caption } = req.body;
  try {
    const newPost = new Post({
      caption: caption,
      imageId: imageId,
      creator: actor,
      commentCount: 0
    });
    const savedPost = await newPost.save();
    res.json(savedPost);
  } catch (err) {
    handleError(err, res);
  }
};

exports.createComment = async (req, res) => {
  const { actor, comment, postId } = req.body;
  try {
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
    handleError(err, res);
  }
};

exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    // Delete the comment
    const comment = await Comment.findById(commentId)
    await comment.delete();

    // Update the post's comment count
    await Post.findByIdAndUpdate(comment.commentId, { $inc: { commentCount: -1 } }, { timestamps: false });

    res.json({});
  } catch (err) {
    handleError(err, res);
  }
};

function handleError(err, res) {
  console.error(err);
  res.status(500).json({ message: 'Server Error' });
}