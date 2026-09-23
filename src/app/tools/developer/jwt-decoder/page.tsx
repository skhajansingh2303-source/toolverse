import AutoToolSeo from '@/components/AutoToolSeo';
import { Metadata } from 'next';
import JwtDecoder from './JwtDecoder';

export const metadata: Metadata = {
  title: 'JWT Decoder - Decode & Inspect JSON Web Tokens Online Free',
  description: 'Free online JSON Web Token (JWT) decoder. Decode, verify, and inspect JWT headers, payloads, and claims safely in your browser without sending data to a server.',
  keywords: ['jwt decoder', 'decode jwt online', 'json web token parser', 'jwt inspector', 'jwt base64url decode', 'jwt claims checker']
};

export default function JwtDecoderPage() {
  return (
    <>
      <JwtDecoder />
      <AutoToolSeo slug="jwt-decoder" />
    </>
  );
}
