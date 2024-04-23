const app = require("../main/server");
const mongoose = require('mongoose');
const request = require('supertest');
const db = require("../main/config/db");

describe('API test', () => {

  beforeAll(async () => {
    await mongoose.connect(db.url);
    await mongoose.connection.dropDatabase();
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })

  const userId1 = "662714e5223b236512063328"
  const userId2 = "662714e5223b236512063329"
  const userId3 = "662714e5223b23651206332a"

  describe("upload image", () => {
    it("should return 201 and the task created", async () => {
      const response = await request(app)
        .post("/api/v1/images")
        .set("content-type", "application/json")
        .send({
          imageUrl: "avatar.png",
          actor: userId1
        });
      
      expect(response.status).toBe(200);
      expect(response.body.originalImageUrl).toBe("avatar.png");
      expect(response.body.jpgImageUrl).toBe("avatar.png.jpg");
      expect(response.body.creator).toBe(userId1);
    });
  });

});