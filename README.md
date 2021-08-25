This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).


### How to build this project
1. Create a file called `next.config.js`in the root folder with the following structure and set the **environment variables**:
```
module.exports = {
	env: {
		cookie_password: "COOKIE PASSWORD HERE",
		MONGO_URI: "MONGO URI HERE"
	}
}
```
**IMPORTANT:** The cookie password has to be at least 32 characters long.

2. Run `npm install` in the root folder.

3. Then, run `npm build`.

4. And finally, `npm start`.