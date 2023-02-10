import Component from "@/core/Component";
import styles from "./SharingMap.module.scss";
import { mapStyle } from "@/utils/mapStyle";
import { loadscript } from "@/utils/googleAPI";
import { qs } from "@/utils/querySelector";

export class SharingMap extends Component {
  async setup() {
    this.state.markers = [];
    this.state.infoWindows = [];
    this.state.userLocation = {};
    this.state.map = null;
    if (this.props.ends) {
      this.state.userLocation = {
        lat: (this.props.ends.latHi + this.props.ends.latLo) / 2,
        lng: (this.props.ends.lngHi + this.props.ends.lngLo) / 2,
      };
    } else {
      if (navigator.geolocation) {
        await navigator.geolocation.getCurrentPosition((position) => {
          this.state.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        });
      }
    }
  }

  template(): string {
    return `
    <div class="${styles["desc"]}">공유하고 싶은 위치를 골라주세요!</div>
    <div id="googleMap" class="${styles["googleMap"]}"></div>`;
  }

  mounted(): void {
    this.init();
  }

  async init() {
    await loadscript(
      `https://maps.googleapis.com/maps/api/js?key=AIzaSyAbVatL-Ju-loj7qQEtCTTHeRZYFIC7JQo&callback=initMap`,
      this.initMap.bind(this)
    );
  }

  initMap() {
    const map = new google.maps.Map(qs("#googleMap")!, {
      zoom: 15,
      center: this.state.userLocation as google.maps.LatLng,
      styles: mapStyle() as object[],
    });
    this.state.map = map;
    this.moveMap();
    const geocoder = new google.maps.Geocoder();
    map.addListener("click", (mapsMouseEvent) => {
      this.placeMarker(mapsMouseEvent.latLng, geocoder);
    });
  }

  moveMap() {
    this.state.map.panTo(this.state.userLocation);
  }

  placeMarker(position: google.maps.LatLng, geocoder: google.maps.Geocoder) {
    if (this.state.infoWindows.length) {
      const lastWindow = this.state.infoWindows.pop() as google.maps.InfoWindow;
      lastWindow.close();
    }
    if (this.state.markers.length) {
      const lastMarker = this.state.markers.pop() as google.maps.Marker;
      lastMarker.setMap(null);
    }
    const marker = new google.maps.Marker({
      position: position,
      map: this.state.map,
    });
    marker.setAnimation(google.maps.Animation.BOUNCE);
    this.state.markers.push(marker);
    this.state.map.panTo(position);
    let content = "";
    geocoder.geocode({ location: position }, (response) => {
      content = response[0].formatted_address;
      const infoWindow = new google.maps.InfoWindow({
        content: content,
      });
      infoWindow.open(this.state.map, marker);
      this.state.infoWindows.push(infoWindow);
    });
    marker.addListener("dblclick", function () {
      marker.setMap(null);
    });
  }
}
