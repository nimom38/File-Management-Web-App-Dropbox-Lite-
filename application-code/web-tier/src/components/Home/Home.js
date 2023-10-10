import React from "react";
import { useHistory } from "react-router-dom";

function Home({ user }) {
  const history = useHistory();

  if (!user) {
    history.push("/signin");
  }

  return <div>{user?.name}</div>;
}

export default Home;
