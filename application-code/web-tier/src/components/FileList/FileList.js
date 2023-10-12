import "./FileList.css";
import FileCard from "../FileCard/FileCard";

function FileList({ user, fileList, setFileList }) {
  return (
    <div className="FileList">
      <div className="FileList__header">
        <h1 className="FileList__header__title">
          {user?.username === "superAdminUser" ? "All files" : "Your files"}
        </h1>
        <p className="FileList__header__admin">
          {" "}
          {user?.username === "superAdminUser" ? "Admin Mode" : ""}
        </p>
        <br />
      </div>

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
