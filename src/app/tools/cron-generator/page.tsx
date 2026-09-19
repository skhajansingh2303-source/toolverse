import { Metadata } from 'next';
import CronGenerator from './CronGenerator';

export const metadata: Metadata = {
  title: 'Cron Expression Generator - Visual Cron Builder Online Free',
  description: 'Free online cron expression generator. Visually build, parse, and translate cron schedules into human-readable text.',
  keywords: ['cron generator', 'cron builder', 'cron expression', 'generate cron job', 'crontab generator', 'cron scheduler']
};

export default function CronGeneratorPage() {
  return <CronGenerator />;
}
