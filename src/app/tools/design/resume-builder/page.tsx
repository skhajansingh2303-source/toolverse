import type { Metadata } from 'next';
import ResumeBuilder from './ResumeBuilder';

export const metadata: Metadata = {
  title: 'Resume Builder - Create Professional CV & Resume Online Free',
  description: 'Create a professional resume or CV for your next job application. Free online resume builder for students and professionals.',
  keywords: ['resume builder', 'cv maker', 'create resume online', 'free resume creator'],
};

export default function Page() {
  return <ResumeBuilder />;
}
