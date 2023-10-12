const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const userRoute = require("./routes/user");
const fileRoute = require("./routes/file");

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// ROUTES FOR OUR API
// =======================================================

//User
app.use("/user", userRoute);

//File
app.use("/file", fileRoute);

//Health Checking
app.get("/health", (req, res) => {
  res.json("This is the health check");
});

app.listen(port, () => {
  console.log(`AB3 backend app listening at http://localhost:${port}`);
});
