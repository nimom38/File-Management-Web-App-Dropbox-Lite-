import React from "react";
import { useHistory } from "react-router-dom";
import "./Home.css";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";

function Home({ user, setUser }) {
  const history = useHistory();

  if (!user) {
    history.push("/signin");
  }

  const signOut = () => {
    setUser(null);
  };

  return (
    <div className="Home">
      <div className="Home__userProfile">
        <h1>Welcome !!</h1>
        <br />
        <h3>Your Profile Info: </h3>
        <div className="Home__userProfile_info">
          <p>First Name: {user?.firstName}</p>
          <p>Last Name: {user?.lastName}</p>
          <p>Username: {user?.username}</p>
          <p>
            Account Type:{" "}
            {user?.username === "superAdminUser" ? "Admin User" : "Normal User"}
          </p>
        </div>

        <br />
        <h3>Actions</h3>
        <Button className="Home__logout" variant="contained" onClick={signOut}>
          Logout
        </Button>
        <Button variant="contained">Upload File</Button>
      </div>
    </div>
  );
}

export default Home;
