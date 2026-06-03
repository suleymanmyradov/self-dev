import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report a Problem | Growth',
  description: 'Report a problem or share feedback to help us improve.',
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
