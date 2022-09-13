import {withSessionRoute} from "@/lib/withSession"
import {User} from "@/lib/mongooseController"


export default withSessionRoute(async({method, body, session}, res) => {
  if (method === "POST") {
    if (typeof body?.name === "string" && typeof body?.password === "string") {
      const {name, password} = body
      try {
        const user = await User.findOne({name}, "-name")
        if (user) {
          if (user.comparePassword(password)) {
            session.user = {
              id: user._id.toJSON(),
              name,
            }
            await session.save()
            res.json(session.user)
          } else {
            res.status(401).json({err: "Incorrect Password"})
          }
        } else {
          res.status(404).json({err: "Not Found"})
        }
      } catch {
        res.status(500).json({err: "An error occurred"})
      }
    } else {
      res.status(400).json({err: '"name" and "password" fields must be strings'})
    }
  }
})
