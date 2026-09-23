import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import PasswordGenerator from './PasswordGenerator';

export const metadata: Metadata = {
  title: 'Password Generator - Create Strong Secure Passwords',
  description: 'Generate strong, secure, random passwords online. Customize length and characters to meet security requirements.',
  keywords: ['password generator', 'strong password', 'random password', 'secure password generator']
};

export default function Page() {
  return (
    <>
      <PasswordGenerator />
      <AutoToolSeo slug="password-generator" />
    </>
  );
}
