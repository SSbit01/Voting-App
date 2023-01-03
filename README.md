# Voting App

This is a [Next.js](https://nextjs.org) platform created by [SSbit01](https://github.com/SSbit01) where users can create polls and everyone can vote in them.

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

## To Do

- ***GLOBAL***
  - Try to cache *SWR* results in `localStorage`. See [Persistent Cache](https://swr.vercel.app/docs/advanced/cache#localstorage-based-persistent-cache)
- `/components/Poll.tsx`
  - **Simplify Structure**: use multiple contexts
- `/pages/api/voted.ts`
  - Sort the results according to when each vote was added, not by poll id
