import type { ReactNode } from 'react'
import { Roboto, Gothic_A1, League_Gothic } from 'next/font/google'
import { LanguageProvider } from '../components/LanguageProvider'
import { TopOfferBar } from '../components/TopOfferBar'
import { Navbar } from '../components/Navbar'
import './globals.css'

const roboto = Roboto({ subsets: ['latin'], weight: ['300', '500'], variable: '--font-roboto' })
const gothicA1 = Gothic_A1({ subsets: ['latin'], weight: '500', variable: '--font-gothic-a1' })
const leagueGothic = League_Gothic({ subsets: ['latin'], weight: '400', variable: '--font-league-gothic' })

export const metadata = {
  title: 'T&A',
  description:
    'Premium car cleaning service in Germany with easy online booking and account management.',
  icons: {
    icon: '/assets/img/favicon.png',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        id="app-root"
        className={`${roboto.variable} ${gothicA1.variable} ${leagueGothic.variable} bg-neutral-bg text-white overflow-x-hidden font-secondary`}
      >
        <LanguageProvider>
          <TopOfferBar />
          <Navbar />
          <main>{children}</main>
        </LanguageProvider>
      </body>
    </html>
  )
}
