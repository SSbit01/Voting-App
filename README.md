# Voting App

This is a [Next.js](https://nextjs.org) platform created by [SSbit01](https://github.com/SSbit01) where users can create polls and everyone can vote in them. It uses a **MongoDB Atlas** database to store users and polls.

### NOTE
This platform has many **security vulnerabilities**. This is just a simple personal project that was made a long time ago. Please use it for simple tasks. [Go to vulnerabilities](#vulnerabilities).

---

## Required environment variables

- `MONGO_URI`
: MongoDB URI string
- `COOKIE_NAME`
: e.g. *voting-app_cookie*
- `COOKIE_PASSWORD`
: complex password at least **32 characters long**

> Remember to **install local packages**, I used [pnpm](https://pnpm.io/) package manager in this project, but of course you can use any other package manager like [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/).

---

This project works like any other [Next.js](https://nextjs.org/) project. The following `scripts` can be found in the `package.json` file and refer to the different development stages.

```json
"dev": "next dev",
"build": "next build",
"start": "next start",
"lint": "next lint"
```

---

## Vulnerabilities

- User ID is exposed to the client.

## Known issues
- The user name is stored in the cookie but it doesn't get updated if another session changes it.

## To Do

- ***GLOBAL***
  - Solve the vulnerabilities and known issues
  - Hash the password on the client side and send the result to the server to verify it. Doing this the server doesn't know the user's password.
  - Try to cache *SWR* results in `localStorage`. See [Persistent Cache](https://swr.vercel.app/docs/advanced/cache#localstorage-based-persistent-cache)
- `/components/Poll.tsx`
  - **Simplify Structure**: use multiple contexts
- `/pages/api/voted.ts`
  - Sort the results according to when each vote was added, not by poll id
- `/pages/api/user/[id].ts`
  - Remove this path. Replace it with just `/pages/api/user`