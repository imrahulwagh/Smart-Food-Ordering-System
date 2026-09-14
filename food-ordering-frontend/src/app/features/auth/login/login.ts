import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';

  loading = false;

  message = '';
  messageType = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(): void {

    // Previous message remove
    this.message = '';

    // =====================================================
    // EMAIL VALIDATION
    // =====================================================

    if (!this.email.trim()) {

      this.message =
        'Please enter your email address.';

      this.messageType = 'error';

      return;
    }


    // =====================================================
    // PASSWORD VALIDATION
    // =====================================================

    if (!this.password.trim()) {

      this.message =
        'Please enter your password.';

      this.messageType = 'error';

      return;
    }


    const loginData = {

      email: this.email.trim(),

      password: this.password

    };

    console.log('Login Data:', loginData);

    this.loading = true;


    // =====================================================
    // LOGIN API
    // =====================================================

    this.http.post<any>(
      'http://localhost:8000/api/auth/login.php',
      loginData
    )
    .pipe(
      timeout(10000)
    )
    .subscribe({

      // ===================================================
      // RESPONSE
      // ===================================================

      next: (res) => {

        console.log(
          'Login Response:',
          res
        );

        this.loading = false;


        // =================================================
        // LOGIN SUCCESS
        // =================================================

        if (
          res &&
          res.success &&
          res.user_id
        ) {

          console.log(
            'Login successful'
          );


          // -----------------------------------------------
          // ACTUAL USER UUID SAVE
          // -----------------------------------------------

          localStorage.setItem(
            'userId',
            res.user_id
          );

          console.log(
            'Saved User ID:',
            localStorage.getItem('userId')
          );


          // =================================================
          // CHECK PENDING CART ITEM
          // =================================================

          const pendingItem =
            localStorage.getItem(
              'pendingCartItem'
            );


          // =================================================
          // PENDING FOOD EXISTS
          // =================================================

          if (pendingItem) {

            try {

              const food =
                JSON.parse(pendingItem);

              console.log(
                'Pending Cart Food:',
                food
              );


              const cartData = {

                user_id: res.user_id,

                food_id: food.id,

                quantity: 1,

                price: food.price

              };


              console.log(
                'Adding pending food to cart:',
                cartData
              );


              // ---------------------------------------------
              // ADD FOOD TO CART
              // ---------------------------------------------

              this.http.post<any>(
                'http://localhost:8000/api/cart/add-cart.php',
                cartData
              )
              .pipe(
                timeout(10000)
              )
              .subscribe({

                next: (cartRes) => {

                  console.log(
                    'Pending Cart Response:',
                    cartRes
                  );


                  // Pending item remove karo
                  localStorage.removeItem(
                    'pendingCartItem'
                  );


                  if (
                    cartRes &&
                    cartRes.success
                  ) {

                    this.message =
                      'Login successful! Item added to your cart.';

                  } else {

                    this.message =
                      'Login successful, but item could not be added to cart.';
                  }

                  this.messageType =
                    cartRes &&
                    cartRes.success
                      ? 'success'
                      : 'error';


                  // Cart page
                  setTimeout(() => {

                    this.router.navigate(
                      ['/cart']
                    );

                  }, 500);

                },

                error: (err) => {

                  console.error(
                    'Pending Cart API Error:',
                    err
                  );


                  localStorage.removeItem(
                    'pendingCartItem'
                  );


                  this.message =
                    'Login successful, but item could not be added to cart.';

                  this.messageType =
                    'error';


                  setTimeout(() => {

                    this.router.navigate(
                      ['/home']
                    );

                  }, 1000);

                }

              });

            } catch (error) {

              console.error(
                'Pending Cart Parse Error:',
                error
              );

              localStorage.removeItem(
                'pendingCartItem'
              );

              this.message =
                'Login successful!';

              this.messageType =
                'success';


              setTimeout(() => {

                this.router.navigate(
                  ['/home']
                );

              }, 500);

            }

          }

          // =================================================
          // NO PENDING CART ITEM
          // =================================================

          else {

            this.message =
              'Login successful! Redirecting...';

            this.messageType =
              'success';


            setTimeout(() => {

              this.router.navigate(
                ['/home']
              );

            }, 500);

          }

        }


        // =================================================
        // LOGIN FAILED
        // =================================================

        else {

          this.message =
            'Invalid email or password. Please check your details.';

          this.messageType =
            'error';

        }

      },


      // ===================================================
      // API ERROR
      // ===================================================

      error: (err) => {

        console.error(
          'Login API Error:',
          err
        );

        this.loading = false;


        // Wrong email/password
        this.message =
          'Invalid email or password. Please check your details.';

        this.messageType =
          'error';

      }

    });

  }


  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  continueWithGoogle(): void {

    console.log(
      'Google Login button clicked'
    );

    this.message =
      'Google login is not configured yet. Please use email and password.';

    this.messageType =
      'error';

  }

}