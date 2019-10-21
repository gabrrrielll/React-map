import React from "react";
import ReactDOM from "react-dom";

const mapStyles = {
    map: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
};

export class CurrentLocation extends React.Component {
    constructor(props) {
        super(props);

        const { lat, lng } = this.props.initialCenter;
        this.state = {
            currentLocation: {
                lat,
                lng,
            },
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.google !== this.props.google) {
            this.loadMap();
        }
        if (prevState.currentLocation !== this.props.state.currentLocation) {
            this.recenterMap();
        }
    }

    componentDidMount() {
        if (this.props.centerAroundCurrentLocation) {
            if (navigator && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    const coords = pos.coords;
                    this.setState({
                        currentLocation: {
                            lat: coords.latitude,
                            lng: coords.longitude,
                        },
                    });
                });
            }
        }
        this.loadMap();
    }

    recenterMap() {
        const map = this.map;
        //console.log("this.map--->", this.map);
        if (this.props.state.currentLocation) {
            const current = this.props.state.currentLocation;

            const google = this.props.google;
            const maps = google.maps;

            if (map) {
                let center = new maps.LatLng(current.lat, current.lng);
                map.panTo(center);
            }
        }
    }

    loadMap() {
        if (this.props && this.props.google) {
            // checks if google is available
            const { google } = this.props;
            const maps = google.maps;
            const mapRef = this.refs.map;

            // reference to the actual DOM element
            const node = ReactDOM.findDOMNode(mapRef);
            let { zoom } = this.props;
            const { lat, lng } = this.state.currentLocation;
            var center = new maps.LatLng(lat, lng);
            const mapConfig = Object.assign(
                {},
                {
                    center,
                    zoom,
                },
            );

            this.map = new maps.Map(node, mapConfig);
            google.maps.event.addListener(this.map, "click", this.props.moveMarker);
        }
    }

    renderChildren() {
        const { children } = this.props;

        if (!children) return;
        return React.Children.map(children, c => {
            if (!c || !this.props.state.currentLocation) return;

            return React.cloneElement(c, {
                map: this.map,
                google: this.props.google,
                mapCenter: this.props.state.currentLocation,
                position: this.props.state.currentLocation,
                //name: this.props.state.countryName,
            });
        });
    }

    render() {
        const style = Object.assign({}, mapStyles.map);
        return (
            <div>
                <div style={style} ref="map">
                    Loading map...
                </div>
                {this.renderChildren()}
            </div>
        );
    }
}

export default CurrentLocation;

CurrentLocation.defaultProps = {
    zoom: 5,
    initialCenter: {
        lat: 44.450622,
        lng: 26.114591,
    },
    centerAroundCurrentLocation: true,
    visible: true,
};
