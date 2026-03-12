import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-page',
  standalone: true,
  templateUrl: './map-page.html',
  styleUrl: './map-page.css'
})
export class MapPage implements OnInit {

  private map: any;

  // Restaurantes simulados
  private restaurants = [
    {
      name: "Pollos Panchita",
      lat: -17.3895,
      lng: -66.1568,
      description: "Pollo frito y combos familiares"
    },
    {
      name: "Burger House",
      lat: -17.3950,
      lng: -66.1600,
      description: "Hamburguesas artesanales"
    },
    {
      name: "Pizza Loca",
      lat: -17.3920,
      lng: -66.1500,
      description: "Pizzas con promociones"
    }
  ];

  ngOnInit(): void {
    this.initMap();
    this.addRestaurants();
  }

  private initMap(): void {

    this.map = L.map('map').setView([-17.3895, -66.1568], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

 
  private addRestaurants(): void {

    this.restaurants.forEach(restaurant => {

      const marker = L.marker([restaurant.lat, restaurant.lng]).addTo(this.map);

      marker.bindPopup(`
        <b>${restaurant.name}</b><br>
        ${restaurant.description}
      `);

    });

  }

}