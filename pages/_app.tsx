import Head from "next/head"
import { SWRConfig } from "swr"

import fetcher from "@/lib/fetchJson"

import AppWrapper from "@/components/Context"
import NavBar from "@/components/NavBar"

import type { AppProps } from "next/app"

import "@/styles/globals.css"



export default function AppPage({ Component, pageProps }: AppProps) {

  const title = "Voting App by SSbit01",
        description = "A Next.js platform where users can create polls and everyone can vote in them",
        themeColor = "#193250"


  return (
    <>
      <Head>

        <title>{title}</title>

        <meta name="application-name" content={title} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={title}/>
        <meta name="description" content={description} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content={themeColor} />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content={themeColor} />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color={themeColor} />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />

      </Head>


      <SWRConfig value={{
        fetcher,
        onError(err) {
          console.error(err)
        }
      }}>
        <AppWrapper>

          <NavBar />

          <Component {...pageProps} />

        </AppWrapper>
      </SWRConfig>
    </>
  )
}