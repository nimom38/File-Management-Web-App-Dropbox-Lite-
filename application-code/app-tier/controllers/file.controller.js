require("dotenv").config();

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const {
  CloudFrontClient,
  CreateInvalidationCommand,
} = require("@aws-sdk/client-cloudfront");
const jwt = require("jsonwebtoken");

const models = require("../models");

const bucketName = process.env.bucketName;
const bucketRegion = process.env.bucketRegion;

const accessKey = process.env.accessKey;
const secretAccessKey = process.env.secretAccessKey;

const publicKeyID = process.env.publicKeyID;
const privateKey = process.env.privateKey;

const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey,
  },
});

const cloudfrontDistributionId = process.env.cloudfrontDistributionId;

const cloudfrontURL = process.env.cloudfrontURL;

const secret = process.env.secret;

const cloudfront = new CloudFrontClient({
  region: "asdsda",
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
});

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const getFiles = async (res, username, userId, doInvalidation) => {
  if (username === "superAdminUser") {
    models.File.findAll().then(async (files) => {
      for (let file of files) {
        const signedUrl = getSignedUrl({
          keyPairId: publicKeyID,
          privateKey: privateKey,
          url: cloudfrontURL + file.fileURL,
          dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        });

        file.dataValues.downloadLink = signedUrl;
      }

      res.status(200).json({
        message: "success upload",
        files: files,
        cat: "cat",
      });
    });
  } else {
    models.File.findAll({ where: { userId: userId } }).then(async (files) => {
      for (let file of files) {
        const signedUrl = getSignedUrl({
          keyPairId: publicKeyID,
          privateKey: privateKey,
          url: cloudfrontURL + file.fileURL,
          dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        });

        file.dataValues.downloadLink = signedUrl;
      }

      res.status(200).json({
        message: "success upload",
        files: files,
        cat: "cat",
      });
    });
  }
};

async function getFileList(req, res) {
  const userId = req.query.userId;
  const username = req.query.username;
  const token = req.query.token;

  jwt.verify(token, secret, function (err, authorized) {
    if (err) {
      res.status(403).json({ message: "unauthorized!", cat: "cat", err });
    }
  });

  getFiles(res, username, userId, false);
}

async function deleteFile(req, res) {
  const userId = req.query.userId;
  const username = req.query.username;
  const token = req.query.token;
  const fileName = req.query.fileId;

  jwt.verify(token, secret, function (err, authorized) {
    if (err) {
      res.status(403).json({ message: "unauthorized!", cat: "cat", err });
    }
  });

  const deleteParams = {
    Bucket: bucketName,
    Key: fileName,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(deleteParams));

    const cfCommand = new CreateInvalidationCommand({
      DistributionId: cloudfrontDistributionId,
      InvalidationBatch: {
        // CallerReference: fileName + "_" + generateFileName(),
        CallerReference: generateFileName(),
        Paths: {
          Quantity: 1,
          Items: ["/" + fileName],
        },
      },
    });
    await cloudfront.send(cfCommand);

    models.File.destroy({ where: { fileURL: fileName } })
      .then(() => {
        getFiles(res, username, userId, true);
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    res.status(500).json({ message: "something went wrong!", err, cat: "cat" });
  }
}

async function updateFile(req, res) {
  const token = req.body.token;

  jwt.verify(token, secret, function (err, authorized) {
    if (err) {
      res.status(403).json({ message: "unauthorized!", err, cat: "cat" });
    }
  });
  const file = req.file;

  const description = req.body.description;
  const uploaderId = req.body.userId;
  const username = req.body.username;
  const fileName = req.body.fileId;
  const fileOriginalName = file?.originalname;

  const fileBuffer = file?.buffer;
  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: file?.mimetype,
  };

  try {
    if (fileBuffer) {
      await s3Client.send(new PutObjectCommand(uploadParams));
    }

    const cfCommand = new CreateInvalidationCommand({
      DistributionId: cloudfrontDistributionId,
      InvalidationBatch: {
        // CallerReference: fileName + "_" + generateFileName(),
        CallerReference: generateFileName(),
        Paths: {
          Quantity: 1,
          Items: ["/" + fileName],
        },
      },
    });
    await cloudfront.send(cfCommand);

    const fileData = {
      fileURL: fileName,
      description: description,
      userId: uploaderId,
      fileName: fileOriginalName,
    };

    models.File.update(fileData, { where: { fileURL: fileName } }).then(
      (result) => {
        getFiles(res, username, uploaderId, true);
      }
    );
  } catch (err) {
    res.status(500).json({ message: "something went wrong!", err, cat: "cat" });
  }
}

async function uploadFile(req, res) {
  const token = req.body.token;

  jwt.verify(token, secret, function (err, authorized) {
    if (err) {
      res.status(403).json({ message: "unauthorized!", err, cat: "cat" });
    }
  });

  const file = req.file;

  if (!file) {
    res.status(500).json({ message: "Please select a file", cat: "cat" });
  }

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
      username: username,
    };

    models.File.create(fileData).then((result) => {
      getFiles(res, username, uploaderId, false);
    });
  } catch (err) {
    res.status(500).json({ message: "something went wrong!", err, cat: "cat" });
  }
}

module.exports = {
  uploadFile: uploadFile,
  getFileList: getFileList,
  deleteFile: deleteFile,
  updateFile: updateFile,
};
