import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demo.html',
  styleUrl: './demo.css'
})
export class Demo implements OnInit {

  foods: any[] = [];

  apiUrl = 'http://localhost:8000/api/foods/get-food.php';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {

    console.log('Demo page started');

    this.http.get<any>(this.apiUrl).subscribe({

      next: (response) => {

        console.log('Backend Response:', response);

        if (response && response.success && response.foods) {

          this.foods = response.foods;

          console.log('Food Data:', this.foods);

        } else {

          console.log('No food data found');

        }

      },

      error: (error) => {

        console.error('API Error:', error);

      }

    });

  }

}