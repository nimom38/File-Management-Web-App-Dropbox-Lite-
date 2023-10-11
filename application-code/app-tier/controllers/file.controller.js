const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const models = require("../models");

const bucketName = "sjsu-homework-2-us-east-1";
const bucketRegion = "us-east-1";

const accessKey = "AKIAUIZZBGCNMWBS5BBG";
const secretAccessKey = "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";

const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey,
  },
});

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const getFiles = (res, username, userId) => {
  if (username === "superAdminUser") {
    models.findAll().then((files) => {
      res.status(200).json({
        message: "success upload",
        files: files,
      });
    });
  } else {
    models.File.findAll({ where: { userId: userId } }).then((files) => {
      res.status(200).json({
        message: "success upload",
        files: files,
      });
    });
  }
};

async function getFileList(req, res) {
  const userId = req.query.userId;
  const username = req.query.username;
  const token = req.query.token;

  getFiles(res, username, userId);
}

async function uploadFile(req, res) {
  const file = req.file;
  const description = req.body.description;
  const uploaderId = req.body.userId;
  const username = req.body.username;

  const fileBuffer = file.buffer;

  const fileName = generateFileName();
  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: file.mimetype,
  };

  // Send the upload to S3
  try {
    await s3Client.send(new PutObjectCommand(uploadParams));

    const fileData = {
      fileURL: fileName,
      description: description,
      userId: uploaderId,
    };

    models.File.create(fileData).then((result) => {
      getFiles(res, username, uploaderId);
    });
  } catch (err) {
    res.status(500).json({ message: "something went wrong!" });
  }
}

module.exports = {
  uploadFile: uploadFile,
  getFileList: getFileList,
};
