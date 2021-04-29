const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

router.post('/', (req, res) => {
  const file = req.files.file;
  console.log(file);
  cloudinary.uploader.upload(file.tempFilePath, { resource_type: "auto" }, function(err, result) {
    if (err) {
      console.log("Error occured in cloudinary upload ", err);
      return res.status(400).json({ msg: 'Error occured in cloudinary upload' });
    }
    else {
      console.log("Result is ", result);
      console.log("Hosted url is ", result.url);

      // TODO Save this URL in database =====================

      res.json({
        msg: "Successfully uploaded file to cloudinary", 
        url: result.url
      });
    }    
  })
});


module.exports = router;