import "./FileCard.css";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";

import moment from "moment";

function FileCard({ file, isAdmin }) {
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
          {moment(file.updatedAt).format("MMMM Do YYYY, h:mm:ss a")}
        </Typography>
        <br />
        <Typography variant="body1" color="text.primary">
          {file.description}
        </Typography>
      </Box>
    </div>
  );
}

export default FileCard;
