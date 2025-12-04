import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonNote,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { addIcons } from 'ionicons';
import { pizza, lockClosed, person, mailOutline, personAddOutline, logInOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonNote,
    CommonModule,
    ReactiveFormsModule,
  ],
})
export class LoginPage implements OnInit {
  authForm!: FormGroup;
  isLoginMode = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastController,
    private loadingCtrl: LoadingController,
    private fb: FormBuilder
  ) {
    addIcons({ pizza, lockClosed, person, mailOutline, personAddOutline, logInOutline });
  }

  ngOnInit() {
    this.authForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    // Only validate if we're in registration mode (confirmPassword has value)
    if (confirmPassword.value && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  get username() {
    return this.authForm.get('username');
  }

  get password() {
    return this.authForm.get('password');
  }

  get confirmPassword() {
    return this.authForm.get('confirmPassword');
  }

  get email() {
    return this.authForm.get('email');
  }

  getUsernameErrorMessage(): string {
    const control = this.username;
    if (control?.hasError('required')) {
      return 'Username is required';
    }
    if (control?.hasError('minlength')) {
      return `Username must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      return `Username must be no more than ${control.errors?.['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const control = this.password;
    if (control?.hasError('required')) {
      return 'Password is required';
    }
    if (control?.hasError('minlength')) {
      return `Password must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      return `Password must be no more than ${control.errors?.['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    const control = this.confirmPassword;
    if (this.authForm.hasError('passwordMismatch') && control?.value) {
      return 'Passwords do not match';
    }
    if (control?.hasError('required') && !this.isLoginMode) {
      return 'Please confirm your password';
    }
    return '';
  }

  getEmailErrorMessage(): string {
    const control = this.email;
    if (control?.hasError('email') && control?.touched) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  async onSubmit() {
    if (this.authForm.invalid) {
      this.markFormGroupTouched(this.authForm);
      this.showToast('Please fix the errors in the form');
      return;
    }

    const formValue = this.authForm.value;
    const loading = await this.loadingCtrl.create({
      message: this.isLoginMode ? 'Logging in...' : 'Registering...',
    });
    await loading.present();

    try {
      let result;
      if (this.isLoginMode) {
        result = await this.authService.login({
          username: formValue.username,
          password: formValue.password,
        });
      } else {
        result = await this.authService.register({
          username: formValue.username,
          email: formValue.email || undefined,
          password: formValue.password,
        });
      }

      await loading.dismiss();

      if (result.success) {
        this.showToast(result.message);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tabs/home';
        this.router.navigateByUrl(returnUrl);
      } else {
        this.showToast(result.message);
      }
    } catch (error) {
      await loading.dismiss();
      this.showToast('An error occurred. Please try again.');
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    if (this.isLoginMode) {
      this.confirmPassword?.clearValidators();
      this.confirmPassword?.updateValueAndValidity();
      this.email?.clearValidators();
      this.email?.updateValueAndValidity();
    } else {
      this.confirmPassword?.setValidators([Validators.required]);
      this.confirmPassword?.updateValueAndValidity();
      // Email is optional, but if provided, must be valid
      this.email?.setValidators([Validators.email]);
      this.email?.updateValueAndValidity();
    }
    this.authForm.reset();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  async showToast(message: string) {
    const t = await this.toast.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    t.present();
  }
}

