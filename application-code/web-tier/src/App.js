import React, { useState } from "react";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";

function App() {
  const [user, setUser] = useLocalStorage("User", { name: "asd" });

  return (
    <div>
      <Router>
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/">
            <Home user={user} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
