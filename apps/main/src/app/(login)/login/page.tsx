import { loginAction } from './login-action';
import { Login } from './Login';

export default function LoginPage() {
  return <Login loginAction={loginAction} />;
}
