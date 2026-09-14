import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css'
})
export class Restaurants {

}