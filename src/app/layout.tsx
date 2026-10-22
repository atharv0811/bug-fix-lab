import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { InlineScript } from "@/components/layout/inline-script";
import { siteConfig } from "@/lib/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the inline script sets data-theme on <html>
    // before React hydrates, so the server and client attributes differ.
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <InlineScript html={themeInitScript} />
      </head>
      {/*
        Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes
        to <body> before hydration. This only silences attribute mismatches on
        this element — children are still checked.
      */}
      <body className="flex min-h-screen flex-col bg-canvas text-fg" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-text focus:shadow-elevated"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
