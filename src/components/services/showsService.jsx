import axios from "axios";

const appId = process.env.REACT_APP_BANDSINTOWN_APP_ID || "artists-choice";
const apiBaseUrl = "https://rest.bandsintown.com";

// Bandsintown supports "geoip" location to resolve events based on requester IP.
const getEventsByLocation = location => {
  return axios
    .get(`${apiBaseUrl}/events`, {
      params: {
        app_id: appId,
        date: "upcoming",
        location,
      },
    })
    .then(res => (Array.isArray(res.data) ? res.data : []));
};

export const getMetroArea = () => {
  return getEventsByLocation("geoip").then(events => {
    if (!events.length) {
      return {
        id: "geoip",
        displayName: "Your Area",
        state: null,
        country: { displayName: "" },
      };
    }
    const venue = events[0] && events[0].venue ? events[0].venue : {};
    return {
      id: "geoip",
      displayName: venue.city || "Your Area",
      state: venue.region ? { displayName: venue.region } : null,
      country: venue.country ? { displayName: venue.country } : { displayName: "" },
    };
  });
};

export const getLocationStringResults = str => {
  if (str.length > 0) {
    return getEventsByLocation(str).then(events => {
      if (!events.length) return [];
      const venue = events[0].venue || {};
      return [
        {
          city: {
            displayName: venue.city || str,
            state: venue.region ? { displayName: venue.region } : null,
            country: { displayName: venue.country || "" },
          },
          metroArea: { id: str },
        },
      ];
    });
  }
  return Promise.resolve([]);
};

export const searchByMetroAreaID = id => {
  return getEventsByLocation(id);
};
