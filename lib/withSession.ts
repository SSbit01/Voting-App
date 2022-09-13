import {withIronSessionApiRoute, withIronSessionSsr} from "iron-session/next"
import type {NextApiHandler, GetServerSideProps} from "next"


const sessionOptions = {
  password: process.env.COOKIE_PASSWORD,
  cookieName: process.env.COOKIE_NAME || "voting-app_cookie",
  cookieOptions: {
    secure: process.env.NODE_ENV == "production",
  }
}


export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions)
}


export function withSessionSsr(handler: GetServerSideProps) {
  return withIronSessionSsr(handler, sessionOptions)
}


export interface UserCookie {
  name?: string
  id?: string
}


export interface VotesCookie {
  [key: string]: string
}


declare module "iron-session" {
  interface IronSessionData {
    user?: UserCookie
    votes?: VotesCookie
  }
}