import AutoToolSeo from '@/components/AutoToolSeo';
import TimestampConverter from './TimestampConverter';

export const metadata = {
  alternates: {
    canonical: 'https://toolsverseapp.com/tools/developer/timestamp-converter/',
  },
    title: 'Unix Timestamp Converter - Convert Epoch Time Online Free',
    description: 'Convert Unix epoch timestamps to human-readable dates and vice-versa. Supports seconds and milliseconds, local time, UTC, and ISO 8601.',
    keywords: ['timestamp converter', 'unix timestamp', 'epoch converter', 'time converter', 'date to timestamp']
};

export default function Page() {
    return (
    <>
      <TimestampConverter />
      <AutoToolSeo slug="timestamp-converter" />
    </>
  );
}
