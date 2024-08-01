import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  private map: any;

  constructor() { }

  ngAfterViewInit(): void {
    this.getPosition().then((pos) => {
      this.initMap(L, [pos.lat, pos.lng]);
      this.addMarker(L, [pos.lat, pos.lng]);
    }).catch((err) => {
      console.error(err);
      const defaultPos: [number, number] = [39.8282, -98.5795];
      this.initMap(L, defaultPos);
      this.addMarker(L, defaultPos);
    });
  }

  private initMap(L: any, center: [number, number]): void {
    this.map = L.map('map', {
      center: center,
      zoom: 3
    });

    L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(this.map);

    const options = {
      position: 'topright',
      drawMarker: false,
      drawPolygon: true,
      drawPolyline: true,
      drawCircle: true,
      drawCircleMarker: true,
      drawRectangle: true,
      cutPolygon: true,
      dragMode: true,
      deleteLayer: true,
      editMode: true,
      rotateMode: true
    };

    this.map.pm.addControls(options);

    this.map.on('pm:create', (e: any) => {
      const layer = e.layer;
      if (layer instanceof L.Rectangle) {
        this.addPointToRectangle(layer);
      }
    });

    this.map.on('pm:remove', (e: any) => {
      console.log('Layer removed:', e);
    });

    this.map.on('pm:edit', (e: any) => {
      console.log('Layer edited:', e);
    });
  }

  private addPointToRectangle(rectangle: L.Rectangle): void {
    const bounds = rectangle.getBounds();
    const center = bounds.getCenter();
    
    // Add a point marker in the middle of the rectangle
    // const pointMarker = L.marker(center, {
    //   icon: L.icon({
    //     iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    //     iconSize: [25, 41]
    //   })
    // });
    // pointMarker.addTo(this.map);
    
    // Update the rectangle to a polygon shape including the new point
    const newLatLngs = [
      bounds.getNorthWest(),
      bounds.getNorthEast(),
      bounds.getSouthEast(),
      bounds.getSouthWest(),
      center // Add the center point to create a new shape
    ];
    
    // Remove the original rectangle
    this.map.removeLayer(rectangle);

    // Create a new polygon with the updated shape
    const newShape = L.polygon(newLatLngs, { color: 'blue', fillOpacity: 0.3 });
    newShape.addTo(this.map);
  }

  private addMarker(L: any, position: [number, number]): void {
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });

    L.marker(position, { icon: defaultIcon }).addTo(this.map);
  }

  private getPosition(): Promise<{ lng: number, lat: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          resp => resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude }),
          err => reject(err)
        );
      } else {
        reject(new Error('Geolocation is not available'));
      }
    });
  }
}
