import "./FileList.css";

function FileList({ user }) {
  return (
    <div className="FileList">
      <h1>
        {user?.username === "superAdminUser" ? "All files" : "Your files"}
      </h1>
      <br />
    </div>
  );
}

export default FileList;
