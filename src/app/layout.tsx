
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { OnlineStatusProvider } from '@/context/OnlineStatusProvider';
import { FontProvider } from '@/components/providers/FontProvider';
import { AccessibilityProvider } from '@/context/AccessibilityProvider';
import { AVAILABLE_FONTS } from '@/lib/fonts.config';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Petediano Pro',
  description: 'Professional AI-powered creative suite by Peter Damiano',
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Petediano Pro",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#9C27B0" />
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
          <FirebaseClientProvider>
            <FontProvider>
              <AccessibilityProvider>
                <OnlineStatusProvider>
                  {children}
                </OnlineStatusProvider>
              </AccessibilityProvider>
            </FontProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
