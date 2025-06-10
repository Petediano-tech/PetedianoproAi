
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { OnlineStatusProvider } from '@/context/OnlineStatusProvider';
import { FontProvider } from '@/components/providers/FontProvider';
import { AVAILABLE_FONTS } from '@/lib/fonts.config';

export const metadata: Metadata = {
  title: 'Petediano Pro',
  description: 'Professional AI-powered creative suite by Peter Damiano',
  // PWA specific metadata
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default', // Or 'black' or 'black-translucent'
    title: 'Petediano Pro',
    // startupImage: [ /* You can add startup images for different devices here */ ],
  },
  formatDetection: {
    telephone: false,
  },
  // Add more PWA related metadata if needed
  // icons: { // Next.js built-in icon handling can also populate some PWA icons
  //   icon: '/icon-192x192.png', // example
  //   apple: '/apple-touch-icon.png', // example
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme color for PWA address bar */}
        <meta name="theme-color" content="#9C27B0" />
        {/* Link to manifest file (already in metadata, but explicit link is good fallback) */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* iOS PWA specific tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Petediano Pro" />
        {/* Placeholder for actual Apple touch icons - you'd replace these with real icon paths */}
        <link rel="apple-touch-icon" href="https://placehold.co/180x180.png?text=P" data-ai-hint="app icon apple" />
        <link rel="apple-touch-icon" sizes="152x152" href="https://placehold.co/152x152.png?text=P" data-ai-hint="app icon apple" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://placehold.co/180x180.png?text=P" data-ai-hint="app icon apple" />
        <link rel="apple-touch-icon" sizes="167x167" href="https://placehold.co/167x167.png?text=P" data-ai-hint="app icon apple" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {AVAILABLE_FONTS.filter(font => font.key !== 'default').map(font => {
          const urls = [];
          if (font.googleImportUrl) urls.push(font.googleImportUrl);
          if (font.googleImportUrlBody && font.googleImportUrlBody !== font.googleImportUrl) urls.push(font.googleImportUrlBody);
          if (font.googleImportUrlHeadline && font.googleImportUrlHeadline !== font.googleImportUrl && font.googleImportUrlHeadline !== font.googleImportUrlBody) urls.push(font.googleImportUrlHeadline);
          return urls.map(url => <link key={url} href={url} rel="stylesheet" />);
        })}
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <FontProvider>
            <OnlineStatusProvider>
              {children}
            </OnlineStatusProvider>
          </FontProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
