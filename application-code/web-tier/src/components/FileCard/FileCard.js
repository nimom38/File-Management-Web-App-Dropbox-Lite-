import { useState } from "react";

import "./FileCard.css";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import axios from "axios";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";

import moment from "moment";
import jwt_decode from "jwt-decode";

function FileCard({ file, setFileList, isAdmin, user, setUser }) {
  if (user) {
    const decodedToken = jwt_decode(user?.token);
    const currentDate = new Date();

    if (decodedToken.exp * 1000 < currentDate.getTime()) {
      setUser(null);
    }
  }

  const [modalOpen, setModalOpen] = useState(false);

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

  const onDelete = () => {
    if (user) {
      const decodedToken = jwt_decode(user?.token);
      const currentDate = new Date();

      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        setUser(null);
      }
    }

    axios
      .delete("http://localhost:4000/file/delete", {
        params: {
          userId: user.id,
          username: user.username,
          fileId: file.fileURL,
          token: user.token,
        },
      })
      .then((res) => {
        setFileList(res.data);
      })
      .catch((err) => {
        console.log("deletion failed");
      });
  };

  const handleSubmitEdit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    axios
      .put(
        "http://localhost:4000/file/update",
        {
          userId: user.id,
          username: user.username,
          token: user.token,
          description: data.get("description"),
          file: data.get("myfile"),
          fileId: file.fileURL,
          fileName: file.fileName,
        },
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      .then((res) => {
        setFileList(res.data);
        setModalOpen(false);
      })
      .catch(function (err) {
        console.log(err);
        setModalOpen(false);
      });
  };

  return (
    <div className="FileCard">
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
          onSubmit={handleSubmitEdit}
        >
          <TextField
            fullWidth
            id="description"
            label="Description"
            name="description"
            placeholder="Add Description"
            defaultValue={file.description}
            multiline
          />
          <br />
          <br />

          <label for="myfile">Select a new different file? </label>
          <input type="file" id="myfile" name="myfile" />

          <br />
          <br />

          <div className="FileCard__modal__buttons">
            <div className="FileCard__modal__close">
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
              Initiate Update
            </Button>
          </div>
        </Box>
      </Modal>
      <Box
        sx={{
          maxWidth: "100%",
          padding: "20px",
          bgcolor: "background.paper",
          border: "1px solid #000",
        }}
        onClick={(event) => event.preventDefault()}
      >
        <Link
          href="#"
          variant="h5"
          onClick={() => {
            if (user) {
              const decodedToken = jwt_decode(user?.token);
              const currentDate = new Date();

              if (decodedToken.exp * 1000 < currentDate.getTime()) {
                setUser(null);
              }
            }
            window.open(file.downloadLink, "_blank");
          }}
        >
          {file.fileName}
        </Link>

        <Typography variant="body2" color="text.secondary">
          Created at: {moment(file.createdAt).format("MMMM Do YYYY, h:mm:ss a")}{" "}
          &nbsp;| &nbsp;Updated at:{" "}
          {moment(file.updatedAt).format("MMMM Do YYYY, h:mm:ss a")} &nbsp;|
          &nbsp;{isAdmin ? "File Owner:  " + file.username : ""}
        </Typography>

        {file.description && <br />}
        <Typography variant="body1" color="text.primary">
          {file.description}
        </Typography>

        {file.description && <br />}
        <br />

        <div className="FileCard__buttons">
          <div className="FileCard__delete">
            <Button variant="contained" onClick={onDelete}>
              Delete
            </Button>
          </div>
          <Button
            variant="contained"
            onClick={() => {
              setModalOpen(true);
            }}
          >
            EDIT
          </Button>
        </div>
      </Box>
    </div>
  );
}

export default FileCard;
