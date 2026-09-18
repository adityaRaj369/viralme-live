import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import {
  APP_CURRENCY,
  APP_DESCRIPTION,
  APP_DOMAIN,
  APP_NAME,
  APP_REGION,
  APP_TAGLINE,
} from "@/lib/constants";
import { ThemeScript } from "@/components/theme-script";
import { getSiteUrl } from "@/lib/site-url";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "pay to rank",
    "leaderboard",
    "startup marketing India",
    "SEO ranking India",
    "product launch Asia",
    "viralme",
    "claim rank",
    "paid placement",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  category: "business",
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      "en-SG": "/",
      "en-MY": "/",
      "en-PH": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["en_SG", "en_MY", "en_PH", "hi_IN"],
    url: siteUrl,
    siteName: APP_NAME,
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.svg" },
  other: {
    "geo.region": "IN",
    "geo.placename": APP_REGION,
    currency: APP_CURRENCY,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: siteUrl,
    description: APP_DESCRIPTION,
    inLanguage: ["en-IN", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en-IN" className={`${jakarta.variable} h-full w-full antialiased`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-dvh w-full flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="w-full flex-1">{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
