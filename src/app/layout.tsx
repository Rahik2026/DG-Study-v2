import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CampusHub — Your College, Connected',
  description: 'The all-in-one college community platform. Chat, share files, track homework, access question banks, and stay connected with your campus.',
  keywords: 'college, community, chat, files, homework, exams, question bank',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#07070e] text-white`}>
        {children}
      </body>
    </html>
  );
}
