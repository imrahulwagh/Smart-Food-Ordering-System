import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {

  name = '';
  email = '';
  phone = '';
  message = '';

  submitForm() {
    alert('Thank you! Your message has been submitted.');
  }

}