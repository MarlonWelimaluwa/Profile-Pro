import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'ProfilePro — Get Your First Client Fast',
    description: 'The complete freelancer success platform. Optimize your Fiverr, Upwork, LinkedIn profile with AI. Get more clients, rank higher, earn more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}