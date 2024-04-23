const app = require("../main/server");
const mongoose = require('mongoose');
const request = require('supertest');
const db = require("../main/config/db");
const Post = require("../main/models/Post");
const Comment = require("../main/models/Comment");

describe('API test', () => {

  beforeAll(async () => {
    await mongoose.connect(db.url);
    await mongoose.connection.dropDatabase();
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })

  const userId1 = "662714e5223b236512063328";
  const userId2 = "662714e5223b236512063329";

  let postId1;
  let postId2;
  let postId3;
  
  let commentId1;
  let commentId2;
  let commentId3;
  let commentId4;
  let commentId5;
  let commentId6;
  

  describe("create posts", () => {

    async function uploadImage(imageUrl, actor) {
      const uploadResp = await request(app)
        .post("/api/v1/images")
        .set("content-type", "application/json")
        .send({
          imageUrl: imageUrl,
          actor: actor
        });

      expect(uploadResp.status).toBe(200);
      expect(uploadResp.body.originalImageUrl).toBe(imageUrl);
      expect(uploadResp.body.jpgImageUrl).toBe(imageUrl + ".jpg");
      expect(uploadResp.body.creator).toBe(actor);
      return uploadResp.body._id;
    }

    async function createPost(imageUrl, actor, caption) {
      const imageId = await uploadImage(imageUrl, actor);
      const createPostResp = await request(app)
        .post("/api/v1/posts")
        .set("content-type", "application/json")
        .send({
          imageId: imageId,
          actor: actor,
          caption: caption
        });

      expect(createPostResp.status).toBe(200);
      expect(createPostResp.body.imageId).toBe(imageId);
      expect(createPostResp.body.caption).toBe(caption);
      expect(createPostResp.body.creator).toBe(actor);
      expect(createPostResp.body.commentCount).toBe(0);
      return createPostResp.body._id;
    }

    it("should be able to create 1st post", async () => {
      postId1 = await createPost("avatar.png", userId1, "User 1, post 1");
    });

    it("should be able to create 2nd post", async () => {
      postId2 = await createPost("cat.jpg", userId1, "User 1, post 2");
    });

    it("should be able to create 3rd post", async () => {
      postId3 = await createPost("dog.jpg", userId2, "User 2, post 1");
    });

  })

  describe("create & delete comments", () => {

    async function createComment(postId, comment, actor) {
      const post = await Post.findById(postId);
      const resp = await request(app)
        .post("/api/v1/comments")
        .set("content-type", "application/json")
        .send({
          actor: actor,
          comment: comment,
          postId: postId
        });

      const updatedPost = await Post.findById(postId);

      expect(resp.status).toBe(200);
      expect(resp.body.postId).toBe(postId);
      expect(resp.body.comment).toBe(comment);
      expect(resp.body.creator).toBe(actor);
      expect(updatedPost.commentCount).toBe(post.commentCount + 1);
      return resp.body._id;
    }

    it("should be able to comment on 1st post", async () => {
      commentId1 = await createComment(postId1, "Hello, it's me", userId1);
      commentId2 = await createComment(postId1, "Hello, it's me again", userId1);
    });

    it("should be able to comment on 2st post", async () => {
      commentId3 = await createComment(postId2, "Hi, it's me!!!!", userId1);
      commentId4 = await createComment(postId2, "Hello", userId2);
      commentId5 = await createComment(postId2, "Hello, how are you", userId1);
    });
    
    it("should be able to comment on 3rd post", async () => {
      commentId6 = await createComment(postId3, "Is there anyone here???", userId2);
    });

    it("should be able to delete comment", async () => {
      const commentId = await createComment(postId2, "Yes, I am here", userId1);
      const post = await Post.findById(postId2);

      const resp = await request(app)
        .delete("/api/v1/comments/" + commentId)
        .set("content-type", "application/json")
        .send({actor: userId1});

      const comment = await Comment.findById(commentId);
      const updatedPost = await Post.findById(postId2);

      expect(resp.status).toBe(200);
      expect(comment).toBe(null);
      expect(updatedPost.commentCount).toBe(post.commentCount - 1);
    });


    it("should not allow delete comment of other user", async () => {
      const resp = await request(app)
        .delete("/api/v1/comments/" + commentId4)
        .set("content-type", "application/json")
        .send({actor: userId1});

      expect(resp.status).toBe(403);
      expect(resp.body.message).toBe("You can only delete comments created by yourself");
    });

  })

  describe("get posts with cursor pagination", () => {

    async function getPosts(prevPostId, limit) {
      const resp = await request(app)
        .get("/api/v1/posts")
        .set("content-type", "application/json")
        .query({prevPostId: prevPostId, limit: limit})
        .send({});

      expect(resp.status).toBe(200);
      return resp.body;
    }

    it("should get posts with empty cursor", async () => {
      const posts = await getPosts("", 2);
      expect(posts.map((post) => post._id)).toStrictEqual([postId2, postId1]);
      expect(posts[0].comments.map((comment) => comment._id)).toStrictEqual([commentId5, commentId4]);
      expect(posts[1].comments.map((comment) => comment._id)).toStrictEqual([commentId2, commentId1]);
    })

    it("should get posts with postId cursor", async () => {
      const posts = await getPosts(postId2, 1000);
      expect(posts.map((post) => post._id)).toStrictEqual([postId1, postId3]);
      expect(posts[0].comments.map((comment) => comment._id)).toStrictEqual([commentId2, commentId1]);
      expect(posts[1].comments.map((comment) => comment._id)).toStrictEqual([commentId6]);
    })
  })

});