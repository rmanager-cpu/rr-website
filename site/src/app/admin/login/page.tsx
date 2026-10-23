import { redirect } from 'next/navigation';
import { adminConfigured, isSignedIn } from '@/lib/admin/session';
import { LoginForm } from './LoginForm';

export default function Login() {
  if (isSignedIn()) redirect('/admin');
  return (
    <main className="adm-main" style={{ minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <LoginForm configured={adminConfigured()} />
    </main>
  );
}
