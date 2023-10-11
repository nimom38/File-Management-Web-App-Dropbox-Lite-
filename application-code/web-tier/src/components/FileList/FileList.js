import "./FileList.css";
import FileCard from "../FileCard/FileCard";

function FileList({ user, fileList, setFileList }) {
  console.log("file", fileList);
  return (
    <div className="FileList">
      <h1>
        {user?.username === "superAdminUser" ? "All files" : "Your files"}
      </h1>
      <br />

      {fileList?.files?.toReversed().map((file) => {
        return (
          <FileCard
            file={file}
            setFileList={setFileList}
            isAdmin={user?.username === "superAdminUser" ? true : false}
            user={user}
          />
        );
      })}
    </div>
  );
}

export default FileList;
