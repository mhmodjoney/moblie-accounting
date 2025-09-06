// controllers/upload.controller.js

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cloudinary config - using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dinxlxqpl",
  api_key: process.env.CLOUDINARY_API_KEY || "634444673623114", 
  api_secret: process.env.CLOUDINARY_API_SECRET || "REm9S0SMlhr1NmnazkLR8mEbdEs"
});

// Storage config for cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "menu_items",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }]
  }
});

// Multer upload config
const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
}).single("image");

// API to handle image upload
exports.uploadImage = (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ 
        message: err.message || "Upload failed",
        error: err.toString()
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        message: "No file uploaded.",
        expectedField: "image",
        usage: "Send a multipart/form-data request with an image file in the 'image' field"
      });
    }

    // Return the Cloudinary URL
    const cloudinaryUrl = req.file.path;
    
    res.status(200).json({
      message: "Image uploaded successfully to Cloudinary!",
      imageUrl: cloudinaryUrl,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      cloudinaryInfo: {
        secure_url: req.file.path,
        public_id: req.file.filename,
        format: req.file.format
      }
    });
  });
};
