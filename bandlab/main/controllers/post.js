const Post = require("../models/Post");
const common = require("./common").handleError;

const DEFAULT_GET_POST_LIMIT = 10;
const MAX_GET_POST_LIMIT = 100;
const DEFAULT_GET_POST_COMMENTS_SIZE = 2;

exports.createPost = async (req, res) => {
  try {
    const { imageId, actor, caption } = req.body;
    const newPost = new Post({
      caption: caption,
      imageId: imageId,
      creator: actor,
      commentCount: 0
    });
    const savedPost = await newPost.save();
    res.json(savedPost);
  } catch (err) {
    common.handleError(err, res);
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { prevPost = "", limit = DEFAULT_GET_POST_LIMIT } = req.body;
    const queryLimit = Math.min(limit, MAX_GET_POST_LIMIT);
    const posts = await queryPosts(prevPost, queryLimit);
    const postsWithComments = await queryPostsComments(posts);
    res.json(postsWithComments);
  } catch (err) {k
    common.handleError(err, res);
  }
}

async function queryPosts(prevPostId, limit) {
  const query = {};
  if (prevPostId != "") {
    const post = await Post.findById(prevPostId);
    query.$or = [
      { commentCount: { $lt: post.commentCount } },
      {
        commentCount: post.commentCount,
        createdAt: { $lt: new Date(post.createdAt) }
      }
    ]
  }

  const posts = await Post.find(query).limit(limit).sort({commentCount: -1, createdAt: -1});
  return posts;

}

async function queryPostsComments(posts) {
  const commentPromises = posts.map(post => fetchLatestComments(post._id));

  const commentsByPost = await Promise.all(commentPromises);

  return postsWithComments = posts.map((post, index) => {
      return {
          ...post,
          comments: commentsByPost[index]
      };
  });
}

async function fetchLatestComments(postId) {
  await Comment.find({ postId: postId }).sort({ createdAt: -1 }).limit(DEFAULT_GET_POST_COMMENTS_SIZE);
}