const express = require("express");
const multer = require("multer");
const fileController = require("../controllers/file.controller");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/list", fileController.getFileList);
router.delete("/delete", fileController.deleteFile);

module.exports = router;
