import "./FileList.css";
import FileCard from "../FileCard/FileCard";

function FileList({ user, fileList }) {
  console.log("file", fileList);
  return (
    <div className="FileList">
      <h1>
        {user?.username === "superAdminUser" ? "All files" : "Your files"}
      </h1>
      <br />

      {fileList?.files?.map((file) => {
        return (
          <FileCard
            file={file}
            isAdmin={user?.username === "superAdminUser" ? true : false}
          />
        );
      })}
    </div>
  );
}

export default FileList;
