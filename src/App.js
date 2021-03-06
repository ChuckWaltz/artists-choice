import React, { Component } from "react";

import RouterComponent from "./components/routerComponent";

import "./App.css";
import "./common/animate.css";

import fire from "./config/fire";

import {
  faHeadphones,
  faBullhorn,
  faUserCircle,
  faUsers,
  faInfinity,
  faMapMarkerAlt,
  faCaretUp
} from "@fortawesome/free-solid-svg-icons";

import {
  faFacebookSquare,
  faTwitter,
  faInstagram
} from "@fortawesome/free-brands-svg-icons";

import { library } from "@fortawesome/fontawesome-svg-core";

library.add(
  faFacebookSquare,
  faTwitter,
  faInstagram,
  faHeadphones,
  faBullhorn,
  faUserCircle,
  faUsers,
  faInfinity,
  faMapMarkerAlt,
  faCaretUp
);

class App extends Component {
  state = {};

  componentDidMount() {
    fire.auth().onAuthStateChanged(user => {
      if (user) {
        //User is signed in.
        console.log(user);
      } else {
        //User is signed out.
      }
    });
  }

  render() {
    return (
      <div className="App">
        <RouterComponent />
      </div>
    );
  }
}

export default App;
