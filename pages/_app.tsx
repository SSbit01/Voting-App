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
        <title>Voting App</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
        <meta name="description" content="Voting App using Next.js created by SSbit01"/>
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
