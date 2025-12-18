import { Component, ChangeDetectionStrategy, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class LoginComponent {
  loginSuccess = output<void>();

  username = signal('admin');
  password = signal('password');

  onLogin() {
    // In a real app, you'd have more robust auth logic here.
    if (this.username() === 'admin' && this.password() === 'password') {
      this.loginSuccess.emit();
    } else {
      alert('Invalid credentials. Hint: use username "admin" and password "password"');
    }
  }
}
