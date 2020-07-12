import React, { Component } from "react";

import "./styles/showsComponent.css";

import {
  getMetroArea,
  getLocationStringResults,
  searchByMetroAreaID,
} from "../../../services/showsService";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import $ from "jquery";

class ShowsComponent extends Component {
  state = {
    currentLocation: {},
    searchbarOpen: false,
    searchbarResults: [],
    showsList: [],
    visibleShows: [],
  };

  componentDidMount() {
    this.getInitialLocation();
    this.locationSearchbarInit();
  }

  getInitialLocation() {
    getMetroArea().then((res) => {
      //console.log(res);
      this.setState({ currentLocation: res });

      let showsList = [];
      searchByMetroAreaID(res.id).then((res) => {
        console.log(res);
        for (let i = 0; i < res.length; i++) {
          let show = {
            eventName: res[i].performance[0]
              ? res[i].performance[0].displayName
              : null,
            venueName: res[i].venue.displayName,
            venueLocation: res[i].location.city,
            eventDate: res[i].start.date,
            eventTime: res[i].start.time,
            eventHeadlinerID: res[i].performance[0]
              ? res[i].performance[0].artist.id
              : null,
            eventUrl: res[i].uri,
          };
          showsList.push(show);
        }
        //console.log(showsList);
        this.setState({ showsList }, () => {
          this.setState({ visibleShows: this.state.showsList.slice(0, 5) });
        });
      });
    }); //test http call
  }

  locationSearchbarInit() {
    $("#location-searchbar").keyup((event) => {
      $(event.target).val().length > 0
        ? this.searchLocationString($(event.target).val())
        : this.setState({ searchbarResults: null });
    });
  }

  showLocationSearchbar = () => {
    if (this.state.searchbarOpen) {
      this.resetSearchbar();
    } else {
      this.setState({ searchbarOpen: true });
      $(".location-searchbar").removeClass("location-searchbar-hidden");
    }
  };

  searchLocationString(str) {
    getLocationStringResults(str).then((res) => {
      res
        ? this.setState({ searchbarResults: res.slice(0, 5) })
        : this.setState({ searchbarResults: null });
    });
  }

  searchShows = (loc) => {
    let showsList = [];
    //console.log(loc);
    searchByMetroAreaID(loc.metroArea.id).then((res) => {
      //console.log(res);
      for (let i = 0; i < res.length; i++) {
        let show = {
          eventName:
            res[i].performance.length > 0
              ? res[i].performance[0].displayName
              : "",
          venueName: res[i].venue.displayName,
          venueLocation: res[i].location.city,
          eventDate: res[i].start.date,
          eventTime: res[i].start.time,
          eventHeadlinerID:
            res[i].performance.length > 0
              ? res[i].performance[0].artist.id
              : "",
          eventUrl: res[i].uri,
        };
        showsList.push(show);
      }
      //console.log(showsList);
      this.setState({ showsList }, () => {
        this.setState({ visibleShows: this.state.showsList.slice(0, 5) });
      });
    });
    this.setState({ currentLocation: loc.city });
    this.resetSearchbar();
  };

  showMoreShows = (amount) => {
    let visibleShows = [];
    visibleShows = this.state.showsList.slice(
      0,
      this.state.visibleShows.length + amount
    );
    this.setState({ visibleShows });
  };

  resetSearchbar() {
    this.setState({ searchbarOpen: false }); //Reset open state
    this.setState({ searchbarResults: null }); //Reset results
    $("#location-searchbar").val(""); //Clear the searchbar
    $(".location-searchbar").addClass("location-searchbar-hidden");
  }

  translateDate(date) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const year = date.substr(0, 4);
    const month = months[date.substr(5, 2) - 1];
    const day = date.substr(8, 2);

    const newDate = month + " " + day + ", " + year;

    return newDate;
  }

  render() {
    return (
      <div id="shows-section" className="row">
        <div id="shows-section-header" className="col-12">
          Upcoming Local Shows
        </div>
        <div id="shows-section-location-header" className="col-12">
          {this.state.currentLocation != null
            ? this.state.currentLocation.displayName
            : null}
          {", "}
          {this.state.currentLocation.state != null
            ? this.state.currentLocation.state.displayName
            : this.state.currentLocation.country != null
            ? this.state.currentLocation.country.displayName
            : null}
          <div id="shows-change-location">
            <button
              id="shows-change-location-button"
              className=""
              onClick={() => this.showLocationSearchbar()}
            >
              <FontAwesomeIcon
                id="location-icon"
                icon={["fas", "map-marker-alt"]}
              />
              Change Location
            </button>
            <div id="location-searchbar-container" className="col-12  ">
              <input
                id="location-searchbar"
                className="form-control location-searchbar location-searchbar-hidden"
                type="search"
                placeholder="Enter City, State, or Country"
              />
              <div id="searchbar-results-container">
                {this.state.searchbarResults && this.state.searchbarOpen
                  ? this.state.searchbarResults.map((loc) => (
                      <div
                        key={this.state.searchbarResults.indexOf(loc)}
                        className="location-searchbar-result"
                        onClick={() => this.searchShows(loc)}
                      >
                        {loc.city.displayName},{" "}
                        {loc.city.state
                          ? loc.city.state.displayName
                          : loc.city.country.displayName}
                        {loc.city.state
                          ? ", " + loc.city.country.displayName
                          : null}
                      </div>
                    ))
                  : null}
              </div>
            </div>
          </div>
        </div>
        <div
          id="shows-section-content"
          className="col-12 col-sm-10 offset-sm-1 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3"
        >
          {this.state.visibleShows.length > 0 ? (
            <ul id="shows-list" className="col">
              {this.state.visibleShows.map((event) => (
                <li
                  key={this.state.visibleShows.indexOf(event)}
                  className="showItem row"
                >
                  <div id="showImageContainer" className="col">
                    <div
                      id="showImage"
                      style={{
                        backgroundImage: `url(${
                          "http://images.sk-static.com/images/media/profile_images/artists/" +
                          event.eventHeadlinerID +
                          "/huge_avatar"
                        })`,
                      }}
                    />
                  </div>
                  <div className="showDetails col">
                    <div className="showDateTime">
                      {this.translateDate(event.eventDate)}
                    </div>
                    <div className="showName">{event.eventName}</div>
                    <div className="showVenue">{event.venueName}</div>
                    <div className="showLocation">{event.venueLocation}</div>
                    <a href={event.eventUrl} target="_blank">
                      <button className="buyTicketsButton">Buy Tickets</button>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          <button id="more-shows-button" onClick={() => this.showMoreShows(5)}>
            See More Shows
          </button>
        </div>
        <div id="shows-section-footer" className="col-12">
          <div>Powered by</div>
          <a href="http://www.songkick.com" target="_blank">
            <img
              id="songkick-logo"
              src={require("../../../../assets/songkick.svg")}
              alt=""
            />
          </a>
        </div>
      </div>
    );
  }
}

export default ShowsComponent;
