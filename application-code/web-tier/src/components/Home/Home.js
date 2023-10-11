import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./Home.css";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import FileList from "../FileList/FileList";
import Modal from "@mui/material/Modal";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

import axios from "axios";

function Home({ user, setUser }) {
  const history = useHistory();
  const [modalOpen, setModalOpen] = useState(false);

  if (!user) {
    history.push("/signin");
  }

  const signOut = () => {
    setUser(null);
  };

  console.log("SADDAS", user);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const handleSubmitUpload = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    console.log("description", data.get("description"));
    console.log("file", data.get("myfile"));

    axios
      .post(
        "http://localhost:4000/file/upload",
        {
          userId: user.id,
          username: user.username,
          description: data.get("description"),
          file: data.get("myfile"),
        },
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      .then(function (res) {
        console.log("successful upload!");
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  return (
    <div className="Home">
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          component="form"
          sx={style}
          noValidate
          autoComplete="off"
          onSubmit={handleSubmitUpload}
        >
          <TextField
            fullWidth
            id="description"
            label="Description"
            name="description"
            placeholder="Add Description"
            multiline
          />
          <br />
          <br />

          <label for="myfile">Select a file: </label>
          <input type="file" id="myfile" name="myfile" />

          <br />
          <br />

          <Button
            className="Home__logout"
            variant="contained"
            onClick={() => {
              setModalOpen(false);
            }}
          >
            Close
          </Button>
          <Button variant="contained" type="submit">
            Initiate Upload
          </Button>
        </Box>
      </Modal>
      <div className="Home__userProfile">
        <h1>Welcome !!</h1>
        <br />
        <h3>Your Profile Info: </h3>
        <div className="Home__userProfile_info">
          <p>First Name: {user?.firstName}</p>
          <p>Last Name: {user?.lastName}</p>
          <p>Username: {user?.username}</p>
          <p>
            Account Type:{" "}
            {user?.username === "superAdminUser" ? "Admin User" : "Normal User"}
          </p>
        </div>

        <br />
        <h3>Actions</h3>
        <Button className="Home__logout" variant="contained" onClick={signOut}>
          Logout
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setModalOpen(true);
          }}
        >
          Upload File
        </Button>
      </div>

      <div className="Home__files">
        <FileList user={user} />
      </div>
    </div>
  );
}

export default Home;
