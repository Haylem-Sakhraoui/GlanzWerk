import type { ReactNode } from 'react'
import { Roboto, Gothic_A1, League_Gothic } from 'next/font/google'
import { LanguageProvider } from '../components/LanguageProvider'
import { TopOfferBar } from '../components/TopOfferBar'
import { Navbar } from '../components/Navbar'
import './globals.css'

const roboto = Roboto({ subsets: ['latin'], weight: ['300', '500'], variable: '--font-roboto' })
const gothicA1 = Gothic_A1({ subsets: ['latin'], weight: '500', variable: '--font-gothic-a1' })
const leagueGothic = League_Gothic({ subsets: ['latin'], weight: '400', variable: '--font-league-gothic' })
const siteUrl = 'https://fahrzeugaufbereitung-ta.de'
const logoUrl = `${siteUrl}/logo.png`

export const metadata = {
  title: 'T&A',
  description:
    'Premium car cleaning service in Germany with easy online booking and account management.',
  metadataBase: new URL(siteUrl),
  icons: {
    icon: '/assets/img/favicon.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'T&A',
    description:
      'Premium car cleaning service in Germany with easy online booking and account management.',
    url: siteUrl,
    siteName: 'T&A',
    images: [
      {
        url: logoUrl,
        width: 512,
        height: 512,
        alt: 'T&A logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'T&A',
    description:
      'Premium car cleaning service in Germany with easy online booking and account management.',
    images: [logoUrl],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'T&A',
    url: siteUrl,
    logo: logoUrl,
  }

  return (
    <html lang="en">
      <body
        id="app-root"
        className={`${roboto.variable} ${gothicA1.variable} ${leagueGothic.variable} bg-neutral-bg text-white overflow-x-hidden font-secondary`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <LanguageProvider>
          <TopOfferBar />
          <Navbar />
          <main>{children}</main>
        </LanguageProvider>
      </body>
    </html>
  )
}
