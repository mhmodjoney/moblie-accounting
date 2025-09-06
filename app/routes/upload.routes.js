// routes/upload.routes.js

module.exports = app => {
  const uploadController = require("../controllers/upload.controller");
  const router = require("express").Router();

  /**
   * @swagger
   * /api/upload-image:
   *   post:
   *     summary: Upload an image file (Max 3MB)
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - in: formData
   *         name: image
   *         type: file
   *         required: true
   *         description: The image file to upload.
   *     responses:
   *       200:
   *         description: Image uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 imageUrl:
   *                   type: string
   */
  router.post("/upload-image", uploadController.uploadImage);

  app.use('/api/upload', router);
};
