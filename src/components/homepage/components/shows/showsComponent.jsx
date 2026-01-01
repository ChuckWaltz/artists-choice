import React, { Component } from "react";

import "./styles/showsComponent.css";

import {
  getMetroArea,
  getLocationStringResults,
  searchByMetroAreaID,
} from "../../../services/showsService";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import $ from "jquery";
import placeholderImage from "../../../../assets/placeholder-music.png";

const ISO_DATE_LENGTH = 10; // YYYY-MM-DD
const DATETIME_MIN_LENGTH = 16; // YYYY-MM-DDTHH:mm

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

  buildShow = (event) => {
    const eventDateTime = event.datetime || "";
    const eventDate = eventDateTime ? eventDateTime.slice(0, ISO_DATE_LENGTH) : "";
    const eventTime =
      eventDateTime && eventDateTime.length >= DATETIME_MIN_LENGTH
        ? eventDateTime.slice(11, 16)
        : "";
    const artist = (event.artists && event.artists[0]) || event.artist || null;
    const venue = event.venue || {};
    const venueLocation = [venue.city, venue.region || venue.country]
      .filter(Boolean)
      .join(", ");
    const eventImage =
      (artist && (artist.image_url || artist.thumb_url)) ||
      event.image_url ||
      null;
    const eventUrl =
      event.url || (event.offers && event.offers[0] && event.offers[0].url) || "#";

    return {
      eventName:
        event.name ||
        event.title ||
        (artist && artist.name) ||
        (event.lineup && event.lineup[0]) ||
        "Live Event",
      venueName: venue.name,
      venueLocation,
      eventDate,
      eventTime,
      eventImage,
      eventUrl,
    };
  };

  getInitialLocation() {
    getMetroArea().then((res) => {
      //console.log(res);
      this.setState({ currentLocation: res });

      let showsList = [];
      searchByMetroAreaID(res.id).then((res) => {
        console.log(res);
        for (let i = 0; i < res.length; i++) {
          showsList.push(this.buildShow(res[i]));
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
        showsList.push(this.buildShow(res[i]));
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
    if (!date || date.length !== ISO_DATE_LENGTH) return "";
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
                          event.eventImage ? event.eventImage : placeholderImage
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
                    <a
                      href={event.eventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="buyTicketsButton">Buy Tickets</button>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) :
          (<div id="no-shows-container">
            No Shows Found
          </div>)}
          <button
            id="more-shows-button"
            onClick={() => this.showMoreShows(5)}
            disabled={
              this.state.showsList.length === 0 ||
              this.state.visibleShows.length >= this.state.showsList.length
            }>
            See More Shows
          </button>
        </div>
        <div id="shows-section-footer" className="col-12">
          <div>Powered by</div>
          <a
            href="https://www.bandsintown.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span id="bandsintown-credit">Bandsintown</span>
          </a>
        </div>
      </div>
    );
  }
}

export default ShowsComponent;
