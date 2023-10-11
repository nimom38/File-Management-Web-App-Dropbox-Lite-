import "./FileList.css";

function FileList({ user, fileList }) {
  console.log("file", fileList);

  return (
    <div className="FileList">
      <h1>
        {user?.username === "superAdminUser" ? "All files" : "Your files"}
      </h1>
      <br />

      {fileList?.map((file) => {
        return <p>{file.id}</p>;
      })}
    </div>
  );
}

export default FileList;
