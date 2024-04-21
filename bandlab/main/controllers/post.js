const Post = require("../models/Post");
const Image = require("../models/Image");
const common = require("./common");
const ObjectId = require("mongoose").Types.ObjectId;

const DEFAULT_GET_POST_LIMIT = 10;
const MAX_GET_POST_LIMIT = 100;
const DEFAULT_GET_POST_COMMENTS_SIZE = 2;

exports.createPost = async (req, res) => {
  try {
    const { imageId, actor, caption } = req.body;
    const newPost = new Post({
      caption: caption,
      imageId: new ObjectId(imageId),
      creator: new ObjectId(actor),
      commentCount: 0
    });
    const savedPost = await newPost.save();
    res.json(savedPost);
  } catch (err) {
    common.handleError(err, res);
  }
}

exports.validateCreatePostParams = async (req, res, next) => {
  const { actor, imageId } = req.body;
  const image = await Image.findById(imageId);

  if (!image) {
    return res.status(400).json({ message: "Image not found" });
  }
  if (image.creator.toString() != actor) {
    return res.status(400).json({ message: "You can only create posts with photos uploaded by yourself" });
  }
  next();
};


exports.getPosts = async (req, res) => {
  try {
    const prevPostId = req.query["prevPostId"];
    const limit = req.query["limit"] ? req.query["limit"] : DEFAULT_GET_POST_LIMIT;
    const queryLimit = Math.min(limit, MAX_GET_POST_LIMIT);
    const posts = await queryPosts(prevPostId, queryLimit);
    const postsWithDetails = await queryPostsDetails(posts);
    res.json(postsWithDetails);
  } catch (err) {
    common.handleError(err, res);
  }
}

exports.validateGetPostsParams = async (req, res, next) => {
  const prevPostId = req.query["prevPostId"];

  if (prevPostId) {
    const post = await Post.findById(prevPostId);
    if (!post) {
      return res.status(400).json({ message: "Previous post not found" });
    }
  }
  next();
}

async function queryPosts(prevPostId, limit) {
  const query = {};
  if (prevPostId) {
    const post = await Post.findById(prevPostId);
    query.$or = [
      { commentCount: { $lt: post.commentCount } },
      {
        commentCount: post.commentCount,
        createdAt: { $lt: new Date(post.createdAt) }
      }
    ]
  }

  const posts = await Post.find(query).limit(limit).sort({ commentCount: -1, createdAt: -1 });
  return posts;

}

// Query post's latest comments & image jpg file id
async function queryPostsDetails(posts) {

  const commentPromises = posts.map(
    post => Comment.find({ postId: post._id }).sort({ createdAt: -1 }).limit(DEFAULT_GET_POST_COMMENTS_SIZE)
  );
  const imagePromises = posts.map(
    post => Image.findById(post.imageId)
  );

  // Query all related comments & images in parallel
  const [commentsByPost, imageByPost] = await Promise.all([
    Promise.all(commentPromises),
    Promise.all(imagePromises)
  ]);

  return postsWithComments = posts.map((post, index) => {
    return {
      ...post,
      comments: commentsByPost[index],
      imageUrl: imageByPost[index].jpgImageUrl
    };
  });
}
