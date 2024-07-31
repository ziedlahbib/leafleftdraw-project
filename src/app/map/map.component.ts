import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  private map: any;
  private drawnItems: any; // To hold drawn items

  constructor() { }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.loadLeaflet().then(L => {
        this.getPosition().then((pos) => {
          this.initMap(L, [pos.lat, pos.lng]);
          this.addMarker(L, [pos.lat, pos.lng]);
        }).catch((err) => {
          console.error(err);
          const defaultPos: [number, number] = [39.8282, -98.5795];
          this.initMap(L, defaultPos);
          this.addMarker(L, defaultPos);
        });
      });
    }
  }

  private async loadLeaflet() {
    const L = await import('leaflet');
    await import('leaflet-draw'); // Import Leaflet Draw
    return L;
  }

  private initMap(L: any, center: [number, number]): void {
    this.map = L.map('map', {
      center: center,
      zoom: 3
    });

    const googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
      maxZoom: 20,
      subdomains:['mt0','mt1','mt2','mt3']
    });

    googleHybrid.addTo(this.map);

    // Initialize Leaflet Draw
    this.drawnItems = L.featureGroup().addTo(this.map);
    const styleOptions: L.PolylineOptions = {
      color: 'blue',
      weight: 4,
      opacity: 0.8,
      fillColor: 'blue',
      fillOpacity: 0.3
    };

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: this.drawnItems
      },
      draw: {
        polygon: {
          shapeOptions: styleOptions
        },
        rectangle: {
          shapeOptions: styleOptions
        },
        polyline: {
          shapeOptions: styleOptions
        },
        circle: false,
        marker: false
      }
    });
    this.map.addControl(drawControl);

    // Handle shape creation
    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      if (layer instanceof L.Polygon || layer instanceof L.Polyline || layer instanceof L.Rectangle) {
        layer.setStyle(styleOptions); // Apply style options to the drawn shape
      }
      this.drawnItems.addLayer(layer);

      // Extract and log coordinates
      this.extractAndLogCoordinates(layer);
    });
  }

  private extractAndLogCoordinates(layer: any): void {
    let coordinates: any;

    if (layer instanceof L.Polygon) {
      coordinates = layer.getLatLngs();
    } else if (layer instanceof L.Polyline) {
      coordinates = layer.getLatLngs();
    } else if (layer instanceof L.Rectangle) {
      coordinates = layer.getBounds();
    } else if (layer instanceof L.Circle) {
      coordinates = {
        center: layer.getLatLng(),
        radius: layer.getRadius()
      };
    } else {
      coordinates = 'Unknown shape type';
    }

    console.log('Coordinates:', coordinates);
  }

  private addMarker(L: any, position: [number, number]): void {
    const myIcon = L.icon({
      iconUrl: 'assets/—Pngtree—hand drawn stereo position positioning_5494340.png', // Replace with your icon image path
      iconSize: [25, 41], // Icon size
      iconAnchor: [12, 41], // Icon anchor point
      popupAnchor: [1, -34] // Popup anchor point
    });

    const marker = L.marker(position, { icon: myIcon });
    marker.addTo(this.map);
  }

  private getPosition(): Promise<{ lng: number, lat: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resp => {
          resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
        },
        err => {
          reject(err);
        });
      } else {
        reject(new Error('Geolocation is not available'));
      }
    });
  }
}
