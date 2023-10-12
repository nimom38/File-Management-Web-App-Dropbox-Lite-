import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./Home.css";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import FileList from "../FileList/FileList";
import Modal from "@mui/material/Modal";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

import axios from "axios";
import jwt_decode from "jwt-decode";

import Snackbar from "@mui/material/Snackbar";

function Home({ user, setUser }) {
  const history = useHistory();
  const [modalOpen, setModalOpen] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState({
    toggle: false,
    message: "",
  });

  useEffect(() => {
    if (user) {
      axios
        .get("/api/file/list", {
          params: {
            userId: user.id,
            username: user.username,
            token: user.token,
          },
        })
        .then((list) => {
          setFileList(list.data);
        })
        .catch((err) => {
          setFileList([]);
        });
    }
  }, [user, user?.id, user?.token, user?.username]);

  if (user) {
    const decodedToken = jwt_decode(user?.token);
    const currentDate = new Date();

    if (decodedToken.exp * 1000 < currentDate.getTime()) {
      setUser(null);
    }
  }

  if (!user) {
    history.push("/signin");
  }

  const signOut = () => {
    setUser(null);
  };

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

    if (!data.get("myfile").name) {
      setOpenSnackbar({ message: "must choose a file!", toggle: true });
      return;
    }

    axios
      .post(
        "/api/file/upload",
        {
          userId: user.id,
          username: user.username,
          token: user.token,
          description: data.get("description"),
          file: data.get("myfile"),
        },
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      .then(function (res) {
        setOpenSnackbar({ message: "upload success!", toggle: true });
        setFileList(res.data);
        setModalOpen(false);
      })
      .catch(function (err) {
        setOpenSnackbar({ message: "upload failed!", toggle: true });
        setModalOpen(false);
      });
  };

  return (
    <div className="Home">
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={openSnackbar.toggle}
        onClose={() => {
          setOpenSnackbar({ message: "", toggle: false });
        }}
        autoHideDuration={2000}
        message={openSnackbar.message}
      />
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

          <div className="Home__modal__buttons">
            <div className="Home__logout">
              <Button
                variant="contained"
                onClick={() => {
                  setModalOpen(false);
                }}
              >
                Close
              </Button>
            </div>
            <Button variant="contained" type="submit">
              Initiate Upload
            </Button>
          </div>
        </Box>
      </Modal>
      <div className="Home__userProfile">
        <h2>Welcome !!</h2>
        <br />
        <h3>Your Profile Info: </h3>
        <div className="Home__userProfile_info">
          <p>First Name: {user?.firstName}</p>
          <p>Last Name: {user?.lastName}</p>
          <p>Username: {user?.username}</p>
          <p>
            Account Type:{" "}
            {user?.username === "superAdminUser"
              ? "Admin User"
              : "Non Admin User"}
          </p>
        </div>

        <br />
        <h3>Actions</h3>
        <div className="Home__buttons">
          <div className="Home__logout">
            <Button variant="contained" onClick={signOut}>
              Logout
            </Button>
          </div>

          <Button
            className="Home__upload"
            variant="contained"
            onClick={() => {
              setModalOpen(true);
            }}
          >
            Upload File
          </Button>
        </div>
      </div>

      <div className="Home__files">
        <FileList
          user={user}
          setUser={setUser}
          fileList={fileList}
          setFileList={setFileList}
        />
      </div>
    </div>
  );
}

export default Home;
