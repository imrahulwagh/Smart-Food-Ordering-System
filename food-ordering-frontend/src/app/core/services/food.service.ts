import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoodService {

  private apiUrl = 'https://smart-food-ordering-system.onrender.com/api/foods';

  constructor(private http: HttpClient) {}

  getFoods(search: string = ''): Observable<any> {

    let url = `${this.apiUrl}/get-food.php`;

    if (search.trim() !== '') {
      url += `?search=${encodeURIComponent(search.trim())}`;
    }

    return this.http.get<any>(url);
  }
}