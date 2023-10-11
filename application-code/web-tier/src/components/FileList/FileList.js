import "./FileList.css";

function FileList({ user, fileList }) {
  {
    fileList?.files?.map((file) => {
      console.log(file.id);
    });
  }
  return (
    <div className="FileList">
      <h1>
        {user?.username === "superAdminUser" ? "All files" : "Your files"}
      </h1>
      <br />

      {fileList?.files?.map((file) => {
        return <p>{file.id}</p>;
      })}
    </div>
  );
}

export default FileList;
