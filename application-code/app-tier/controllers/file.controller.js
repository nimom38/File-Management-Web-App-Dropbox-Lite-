const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
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
    models.findAll().then(async (files) => {
      for (let file of files) {
        // For each file, generate a signed URL and save it to the file object
        file.dataValues.downloadLink = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: file.fileURL,
          }),
          { expiresIn: 60 } // 60 seconds
        );
      }

      res.status(200).json({
        message: "success upload",
        files: files,
      });
    });
  } else {
    models.File.findAll({ where: { userId: userId } }).then(async (files) => {
      for (let file of files) {
        // For each file, generate a signed URL and save it to the file object
        file.dataValues.downloadLink = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: file.fileURL,
          }),
          { expiresIn: 60 } // 60 seconds
        );
      }

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

async function deleteFile(req, res) {
  const userId = req.query.userId;
  const username = req.query.username;
  const token = req.query.token;
  const fileName = req.query.fileId;

  const deleteParams = {
    Bucket: bucketName,
    Key: fileName,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(deleteParams));

    models.File.destroy({ where: { fileURL: fileName } })
      .then(() => {
        getFiles(res, username, userId);
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    res.status(500).json({ message: "something went wrong!" });
  }
}

async function uploadFile(req, res) {
  const file = req.file;
  const description = req.body.description;
  const uploaderId = req.body.userId;
  const username = req.body.username;

  const fileBuffer = file.buffer;
  const fileOriginalName = file.originalname;
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
      fileName: fileOriginalName,
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
  deleteFile: deleteFile,
};
