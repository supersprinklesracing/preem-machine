import { loginAction } from './login-action';
import { Login as ClientLogin } from './Login';

export default function Login() {
  return <ClientLogin loginAction={loginAction} />;
}
