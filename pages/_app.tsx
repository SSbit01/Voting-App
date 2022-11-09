import Head from "next/head"
import {SWRConfig} from "swr"

import fetcher from "@/lib/fetchJson"

import AppWrapper from "@/components/Context"
import NavBar from "@/components/NavBar"

import type {AppProps} from "next/app"

import "@/styles/globals.css"


export default function AppPage({Component, pageProps}: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8"/>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"/>
        <meta name="description" content="Voting App made with Next.js created by SSbit01"/>
        <meta name="theme-color" content="#7d1964"/>

        <link rel="mask-icon" href="/icon.svg" color="#19327d"/>
        <link rel="shortcut icon" href="/favicon.ico"/>
        <link rel="manifest" href="/manifest.json"/>

        <title>Voting App</title>
      </Head>
      <SWRConfig value={{
        fetcher,
        onError(err) {
          console.error(err)
        }
      }}>
        <AppWrapper>
          <NavBar/>
          <Component {...pageProps}/>
        </AppWrapper>
      </SWRConfig>
    </>
  )
}
