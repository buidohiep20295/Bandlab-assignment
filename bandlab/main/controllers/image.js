const Image = require("../models/Image");
const common = require("./common");
const ObjectId = require("mongoose").Types.ObjectId;

/**
 * 
 * To keep this simple, we don't give the implementation details of the upload image here
 * The simple implementation can be:
 * - multer: config limit size of 100MB, limit file extensions to .png, .jpg, .bmp
 * - aws-sdk to upload file to s3
 * - aws-lambda with the work of resize to 600x600 & convert the image into jpg format
 * 
 * For the scope of this project, we use this API to simply create a dummy image
 */
exports.uploadImage = async (req, res) => {
  try {
    // Upload image logic go here...
    const { imageUrl, actor } = req.body;

    // Calling the aws lambda function here...
    const jpgImageUrl = awsLambdaConvertImage(imageUrl);

    const newImage = new Image({
      originalImageUrl: imageUrl,
      jpgImageUrl: jpgImageUrl,
      creator: new ObjectId(actor)
    });

    const savedImage = await newImage.save();
    res.json(savedImage);
  } catch (err) {
    common.handleError(err, res);
  }
};

// Just a mock function
function awsLambdaConvertImage(imageUrl) {
  return imageUrl + ".jpg"
}