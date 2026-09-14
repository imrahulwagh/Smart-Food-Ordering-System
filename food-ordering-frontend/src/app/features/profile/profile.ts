import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { HttpClient } from '@angular/common/http';

import { CommonModule } from '@angular/common';

import { timeout } from 'rxjs/operators';

import { FormsModule } from '@angular/forms';


@Component({

  selector: 'app-profile',

  standalone: true,

  imports: [
    RouterLink,
    CommonModule,
    FormsModule
  ],

  templateUrl: './profile.html',

  styleUrl: './profile.css'

})


export class Profile implements OnInit {


  // =====================================================
  // USER DATA
  // =====================================================

  user: any = null;

  loading = true;


  // =====================================================
  // EDIT PROFILE
  // =====================================================

  editMode = false;

  saving = false;

  editName = '';

  editPhone = '';


  // =====================================================
  // MESSAGE
  // =====================================================

  message = '';

  messageType = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private http: HttpClient,

    private router: Router,

    private cdr: ChangeDetectorRef

  ) {}


  // =====================================================
  // PAGE LOAD
  // =====================================================

  ngOnInit(): void {

    const userId =
      localStorage.getItem('userId');


    console.log(
      'Profile User ID:',
      userId
    );


    // ===================================================
    // USER LOGIN CHECK
    // ===================================================

    if (!userId) {

      console.log(
        'User is not logged in'
      );


      this.loading = false;


      // Angular UI update

      this.cdr.detectChanges();


      this.router.navigate([
        '/login'
      ]);


      return;
    }


    // ===================================================
    // GET PROFILE
    // ===================================================

    this.getProfile(userId);

  }


  // =====================================================
  // GET PROFILE
  // =====================================================

  getProfile(
    userId: string
  ): void {

    this.loading = true;


    this.http.get<any>(

      `https://smart-food-ordering-system.onrender.com/api/profile/get-profile.php?user_id=${userId}`

    )

    .pipe(

      timeout(10000)

    )

    .subscribe({

      // =================================================
      // SUCCESS
      // =================================================

      next: (res) => {

        console.log(
          'Profile API Response:',
          res
        );


        // =================================================
        // PROFILE FOUND
        // =================================================

        if (

          res &&

          res.success &&

          res.profile

        ) {

          this.user =
            res.profile;


          console.log(
            'Profile Data:',
            this.user
          );

        }

        else {

          this.user = null;

        }


        // =================================================
        // LOADING COMPLETE
        // =================================================

        this.loading = false;


        // =================================================
        // IMPORTANT FIX
        // =================================================
        // API se data aane ke turant baad
        // Angular screen update karega.

        this.cdr.detectChanges();

      },


      // =================================================
      // ERROR
      // =================================================

      error: (err) => {

        console.error(
          'Profile API Error:',
          err
        );


        this.user = null;

        this.loading = false;


        // =================================================
        // IMPORTANT FIX
        // =================================================

        this.cdr.detectChanges();

      }

    });

  }


  // =====================================================
  // START EDIT
  // =====================================================

  editProfile(): void {

    if (!this.user) {

      return;

    }


    this.editName =
      this.user.full_name;


    this.editPhone =
      this.user.phone;


    this.message = '';

    this.messageType = '';


    this.editMode = true;


    console.log(
      'Edit mode enabled'
    );


    this.cdr.detectChanges();

  }


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  cancelEdit(): void {

    this.editMode = false;

    this.message = '';

    this.messageType = '';


    this.cdr.detectChanges();

  }


  // =====================================================
  // SELECT PHOTO
  // =====================================================

  selectPhoto(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (

      !input.files ||

      input.files.length === 0

    ) {

      return;

    }


    const file =
      input.files[0];


    console.log(
      'Selected Photo:',
      file
    );

  }


  // =====================================================
  // REMOVE PHOTO
  // =====================================================

  removePhoto(): void {

    console.log(
      'Remove photo clicked'
    );

  }


  // =====================================================
  // SAVE PROFILE
  // =====================================================

  saveProfile(): void {

    const userId =
      localStorage.getItem('userId');


    // ===================================================
    // USER LOGIN CHECK
    // ===================================================

    if (!userId) {

      this.message =
        'User is not logged in.';


      this.messageType =
        'error';


      this.cdr.detectChanges();


      return;

    }


    // ===================================================
    // NAME VALIDATION
    // ===================================================

    if (
      !this.editName.trim()
    ) {

      this.message =
        'Full name is required.';


      this.messageType =
        'error';


      this.cdr.detectChanges();


      return;

    }


    // ===================================================
    // PHONE VALIDATION
    // ===================================================

    if (

      !/^[0-9]{10}$/.test(

        this.editPhone.trim()

      )

    ) {

      this.message =
        'Phone number must contain 10 digits.';


      this.messageType =
        'error';


      this.cdr.detectChanges();


      return;

    }


    // ===================================================
    // UPDATE DATA
    // ===================================================

    const updateData = {

      user_id:
        userId,

      full_name:
        this.editName.trim(),

      phone:
        this.editPhone.trim()

    };


    console.log(
      'Updating Profile:',
      updateData
    );


    // ===================================================
    // START SAVING
    // ===================================================

    this.saving = true;

    this.message = '';

    this.messageType = '';


    this.cdr.detectChanges();


    // ===================================================
    // UPDATE API
    // ===================================================

    this.http.put<any>(

      'https://smart-food-ordering-system.onrender.com/api/profile/update-profile.php',

      updateData

    )

    .pipe(

      timeout(10000)

    )

    .subscribe({

      // =================================================
      // SUCCESS RESPONSE
      // =================================================

      next: (res) => {

        console.log(
          'Update Profile Response:',
          res
        );


        // =================================================
        // SUCCESS
        // =================================================

        if (

          res &&

          res.success &&

          res.profile

        ) {

          // =============================================
          // UPDATE CURRENT PROFILE
          // =============================================

          this.user = {

            ...this.user,

            full_name:
              res.profile.full_name,

            phone:
              res.profile.phone

          };


          // =============================================
          // CLOSE EDIT MODE
          // =============================================

          this.editMode = false;


          // =============================================
          // SUCCESS MESSAGE
          // =============================================

          this.message =
            'Profile updated successfully!';


          this.messageType =
            'success';


          console.log(
            'Profile updated successfully'
          );

        }


        // =================================================
        // BACKEND FAILURE
        // =================================================

        else {

          this.message =

            res?.message ||

            'Profile update failed.';


          this.messageType =
            'error';

        }


        // =================================================
        // STOP SAVING
        // =================================================

        this.saving = false;


        // =================================================
        // IMPORTANT FIX
        // =================================================

        this.cdr.detectChanges();

      },


      // =================================================
      // API ERROR
      // =================================================

      error: (err) => {

        console.error(
          'Update Profile API Error:',
          err
        );


        this.message =
          'Could not update profile.';


        this.messageType =
          'error';


        // =================================================
        // STOP SAVING
        // =================================================

        this.saving = false;


        // =================================================
        // IMPORTANT FIX
        // =================================================

        this.cdr.detectChanges();

      }

    });

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    console.log(
      'Logging out user'
    );


    localStorage.removeItem(
      'userId'
    );


    localStorage.removeItem(
      'pendingCartItem'
    );


    this.router.navigate([
      '/login'
    ]);

  }
  goToOrders(): void {
  this.router.navigate(['/orders']);
}

}