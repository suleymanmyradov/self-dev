import { cookies } from 'next/headers';
import RootLayout from './layout';

export default async function RootServerLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

    return <RootLayout defaultOpen={defaultOpen}>{children}</RootLayout>;
}
