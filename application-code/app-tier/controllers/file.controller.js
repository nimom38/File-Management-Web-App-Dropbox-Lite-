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

const bucketName = "sjsu-homework-2-us-east-1";
const bucketRegion = "us-east-1";

const accessKey = "AKIAUIZZBGCNMWBS5BBG";
const secretAccessKey = "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";

const publicKeyID = "K3IKMRQYP7MPWF";
const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4Wyhgw7CMzVIr
hk/RMmlZhr50FVT6do/zA9E3k4R4c/UO7kr1xvtAPXct87y+yMdIg+Es6Ztr3xDU
yjW2o2HJwyLTT71Fprsvc1IsurVWCIluwyd2pwgoX1Q3R4Ti6wu3oT+tKezJQKbS
AfQP/962P61UTj41CYPthvtQ99b0sWSTnymFyOt8Ci6C7qtI3VQ8IdYsN7V8vjyV
IrtUNq+wCnJ5b7uUSdI/lb7uF6ovi1XugMSxWqhGbjSsYmOv1nvWlc1uYkvn7Mp6
0FcejcbpxkBQj9i164mRVAnwvKZ6i7is0B+HaYQZlGHGpnjg9mlbQC/yghX5bfFy
wDcJl7izAgMBAAECggEAGJ7wAxBPdVZ8eVycL0ukvzScHeO1cCfCbMmfOOVmJTIT
UdWoRC+5YWh0ELqDBBXLa5dVTMq8G4l0dX618rjaN/hsH72AARvV1u33VQrwadeF
Bzpf/FwtXjrxA9r019tdOr55wxYczfno7ZYeMr7QzxUtAFvcufeV23SR/svCtPX7
ZNJ2L6aScqC8WPyNWaHV0XlA+sOATbuVhWNezNgY+0do6TpPpkujKhKR3nSBSBQd
avzUnBRWo+mlvjvw1RfzdkSf5c0RyXwIqi5aJDRMCzq8megg0ifBQ3W4fDtMAiG/
cs1khqaQ3bxryt60/UrbZ+Fv7S4KgOJpYtrC7KZybQKBgQD6UdPrkMaGSsv7lm76
Gy9rPNXCHC3o9t3sxCAghBoDyKQBBXfeJckdnAfhpwTEPLKP2hhj7h25zs6G4/AQ
oFS3PnbfuOfC8Fg82bg1NpkN1/aemVz03PJ+2u6RJQRzwDcoUnnmxITOLyAgI79N
tBdWtqSf4mLTEBfQ+5g/5Nd+RQKBgQC8iiFhI9u9eVX6mUn3hDEbZgRNn638KZIB
XzxOnRNrWv6au8+1wKd53zb/R1N8vQC2i61QhIA5/rNqzoZjHf3LuXn9Y2/QEb+h
4LW656LRroDTZ7Vgd+TVU8FbyEoGjLWYKSybELFGsEFZGZg3Ng9bVXrLjTSbjVY8
Y+f1/aYmlwKBgQDQ1Acp1KPqUOgPwZZfzOIoYp4py/x5B8poxc3PkqVpVq+LspYn
m/pGW28vz3hohgKpg9cpNvNRmbguTGZwWHGUVeYyCj4/IOdcDH5i1mOlau/xrBwi
o1kif17bc7hdIJRjbTsJTBVHNYVliq0EFCQMUV7Ri7nKPvi/fcWsOCuWyQKBgBWj
AHumYtRWtWBB8TQfjocnaP0DgzL6DlBr/n7DFfRvB+L4BLlF97JLxIL9S354LjnE
w8oGurRtH2f1dYSwb2zOx0ol/DHzp3tLT2+4n33SueQI9c6xU6iLqRgAX0ZrJXfl
2cGd48pJ9eXkwwwq/w4rPCFZ/hyP1sKtcHRRfJzXAoGAXaZv/GnuKCv9XcfNHrsx
hFwEGNIG+ExuV1/VnPoq+Nied7kcEY6fkflwsbc5vrIPq+pAJ4Zy0t3h8sjXOxtB
mTGQ7EvIefTIpTcYIlLxIOMbalIVLHereJ8eZYRFb8UjrO2vb+1VilCuUtd6ve9d
JgVbcOJ4cl2Sj8eOjop7yrw=
-----END PRIVATE KEY-----`;

const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey,
  },
});

const cloudfrontDistributionId = "E126KC6RVLZSFI";

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
          url: "https://d2adwnxf8luzac.cloudfront.net/" + file.fileURL,
          dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        });

        file.dataValues.downloadLink = signedUrl;
      }

      res.status(200).json({
        message: "success upload",
        files: files,
      });
    });
  } else {
    models.File.findAll({ where: { userId: userId } }).then(async (files) => {
      for (let file of files) {
        const signedUrl = getSignedUrl({
          keyPairId: publicKeyID,
          privateKey: privateKey,
          url: "https://d2adwnxf8luzac.cloudfront.net/" + file.fileURL,
          dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        });

        file.dataValues.downloadLink = signedUrl;
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

  jwt.verify(token, "secret", function (err, authorized) {
    if (err) {
      res.status(403).json({ message: "unauthorized!" });
    }
  });

  getFiles(res, username, userId, false);
}

async function deleteFile(req, res) {
  const userId = req.query.userId;
  const username = req.query.username;
  const token = req.query.token;
  const fileName = req.query.fileId;

  jwt.verify(token, "secret", function (err, authorized) {
    if (err) {
      res.status(403).json({ message: "unauthorized!" });
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
    res.status(500).json({ message: "something went wrong!", err });
  }
}

async function updateFile(req, res) {
  const token = req.body.token;

  jwt.verify(token, "secret", function (err, authorized) {
    if (err) {
      res.status(403).json({ message: "unauthorized!" });
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
    res.status(500).json({ message: "something went wrong!", err });
  }
}

async function uploadFile(req, res) {
  const token = req.body.token;

  jwt.verify(token, "secret", function (err, authorized) {
    if (err) {
      res.status(403).json({ message: "unauthorized!" });
    }
  });

  const file = req.file;

  if (!file) {
    res.status(500).json({ message: "Please select a file" });
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
    res.status(500).json({ message: "something went wrong!", err });
  }
}

module.exports = {
  uploadFile: uploadFile,
  getFileList: getFileList,
  deleteFile: deleteFile,
  updateFile: updateFile,
};
