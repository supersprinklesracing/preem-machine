
import { loginAction } from './login-action';
import { LoginPage as ClientLoginPage } from './LoginPage';

export default function Login() {
  return <ClientLoginPage loginAction={loginAction} />;
}
