import "./FileCard.css";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import axios from "axios";

import moment from "moment";

function FileCard({ file, setFileList, isAdmin, user }) {
  const onDelete = () => {
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

  return (
    <div className="FileCard">
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
            window.open(file.downloadLink, "_blank");
          }}
        >
          {file.fileName}
        </Link>

        <Typography variant="body2" color="text.secondary">
          Created at: {moment(file.createdAt).format("MMMM Do YYYY, h:mm:ss a")}{" "}
          &nbsp;| &nbsp;Updated at:{" "}
          {moment(file.updatedAt).format("MMMM Do YYYY, h:mm:ss a")} &nbsp;|
          &nbsp;{isAdmin ? "File Owner:" + file.username : ""}
        </Typography>

        <br />
        <Typography variant="body1" color="text.primary">
          {file.description}
        </Typography>

        <br />
        <br />

        <div className="FileCard__buttons">
          <div className="FileCard__delete">
            <Button variant="contained" onClick={onDelete}>
              Delete
            </Button>
          </div>
          <Button variant="contained">EDIT</Button>
        </div>
      </Box>
    </div>
  );
}

export default FileCard;
