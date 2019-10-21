import React from "react";
import { GoogleApiWrapper, InfoWindow, Marker } from "google-maps-react";
import axios from "axios";
import CurrentLocation from "./Map";
import "./style.css";

export class MapContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showingInfoWindow: true,
            dayStatus: "",
            activeMarker: {},
            selectedPlace: {},
            countryName: "",
        };
    }
    moveMarker = event => {
        //console.log("moveMarker--->", InfoWindow);

        this.setState({
            currentLocation: {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            },
            showingInfoWindow: false,
        });
        this.checkTimeZone(event.latLng.lat(), event.latLng.lng());
    };
    onMarkerClick = (props, marker, e) => {
        this.setState({
            selectedPlace: props,
            activeMarker: marker,
            showingInfoWindow: true,
        });
    };
    checkTimeZone(lat, lng) {
        axios
            .get("https://api.timezonedb.com/v2.1/get-time-zone?key=6F6YBU30VGBM&format=json&by=position&lat=" + lat + "&lng=" + lng, { mode: "no-cors" })
            .then(response => {
                //console.log("checkTimeZone response->", response.data);
                this.setState({ countryName: response.data.countryName, localTimeStamp: response.data.timestamp });
                if (response.data.timestamp) this.checkDayLimit(lat, lng, response.data.timestamp);
            })
            .catch(error => {
                console.log(error);
            });
    }
    checkDayLimit(lat, lng, localTimeStamp) {
        axios
            .get("https://api.sunrise-sunset.org/json?lat=" + lat + "&lng=" + lng + "&formatted=0", { mode: "no-cors" })
            .then(response => {
                console.log("checkTimeZone response->", response.data);
                var sunriseTime = new Date(response.data.results.sunrise).getTime() / 1000; //extract sunrise time and convert in UNIX time
                var sunsetTime = new Date(response.data.results.sunset).getTime() / 1000; //extras sunset time and convert in UNIX time
                var time = new Date(response.data.results.sunrise).getTimezoneOffset() * 60 + localTimeStamp;

                console.log("sunrise to compare--->", sunriseTime, time, sunsetTime);
                if (sunriseTime < time && time < sunsetTime) {
                    //compare time to check if the time is in the day limits
                    this.setState({ dayStatus: "Daylight" });
                } else {
                    this.setState({ dayStatus: "Night" });
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
    onClose = () => {
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null,
            });
        }
    };

    render() {
        return (
            <CurrentLocation centerAroundCurrentLocation google={this.props.google} moveMarker={this.moveMarker} state={this.state}>
                <Marker onClick={this.onMarkerClick} />
                <InfoWindow marker={this.state.activeMarker} visible={this.state.showingInfoWindow} onClose={this.onClose}>
                    <div>
                        <h2>{this.state.countryName === "" ? "Loading..." : this.state.countryName}</h2>
                        <h4>{this.state.dayStatus === "" ? "Loading..." : this.state.dayStatus}</h4>
                    </div>
                </InfoWindow>
            </CurrentLocation>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: "AIzaSyA2sDQZ-36NLlY4iMvoiuQ7mS1n-v8iq2M",
})(MapContainer);
