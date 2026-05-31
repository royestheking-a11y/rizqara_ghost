import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RizQara Ghost | AI Business Intelligence Platform",
  description: "Analyze competitors, discover hidden technology stacks, identify growth opportunities, audit websites, and generate AI-powered business proposals instantly.",
  keywords: [
    "AI business intelligence", "website intelligence platform", "competitor analysis software", 
    "website auditing tool", "lead generation software", "B2B lead discovery", 
    "technology stack detector", "business intelligence platform", "competitor research tool", 
    "AI lead generation", "website analysis software", "growth opportunity scanner", 
    "business audit software", "AI market intelligence", "digital agency lead finder",
    "discover website technology stack", "AI competitor analysis tool", "automated website audit software",
    "generate website improvement reports", "find business growth opportunities", "competitor website intelligence platform",
    "AI business proposal generator", "identify website weaknesses automatically", "lead generation from website analysis",
    "B2B prospect intelligence software", "website technology detection tool", "AI-powered market research software"
  ],
  openGraph: {
    title: "RizQara Ghost – AI Business Intelligence Engine",
    description: "Expose hidden technologies, discover business opportunities, and generate high-converting growth proposals with AI-powered intelligence.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RizQara Ghost | Internet Intelligence Platform",
    description: "Competitor Analysis. Technology Discovery. Growth Intelligence. Lead Generation. Powered by AI.",
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon.ico' }
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png' }
    ]
  },
  manifest: '/favicon/site.webmanifest'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-white/10`}
        suppressHydrationWarning
      >
        {/* JSON-LD Schema for SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "RizQara Ghost",
              "applicationCategory": [
                "BusinessApplication",
                "MarketingApplication",
                "AnalyticsApplication",
                "ProductivityApplication"
              ],
              "operatingSystem": "Any",
              "description": "RizQara Ghost is an advanced AI-powered Internet Intelligence platform designed for agencies, consultants, sales teams, and business owners. Analyze websites, uncover hidden technology stacks, identify growth opportunities, audit digital performance, and generate actionable business recommendations in seconds."
            })
          }}
        />
        <div className="fixed inset-0 pointer-events-none z-50 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
