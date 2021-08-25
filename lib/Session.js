import {withIronSession} from "next-iron-session";

export default function Session(handler) {
  return withIronSession(
    handler,
    {
      password: process.env.cookie_password,
      cookieName: "voting-app_cookie"
    }
  );
}