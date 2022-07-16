import React from "react";
import Menu from "./Menu";
import Routes from "./Routes";

import "./Layout.css";

function Layout() {
  return (
    <div className="container-fluid ">
      <div className="row min-vh-100 flex-column flex-md-row">
        <div className="col-12 col-md-2 p-0 bg-dark flex-shrink-1 side-bar">
          <Menu />
        </div>
        <div className="col bg-white ">
          <Routes />
        </div>
      </div>
    </div>
  );
}

export default Layout;