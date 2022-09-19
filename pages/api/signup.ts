import {withSessionRoute} from "@/lib/withSession"
import {User} from "@/lib/mongooseController"


export default withSessionRoute(async({method, body, session}, res) => {
  if (method === "POST") {
    if (typeof body?.name === "string" && typeof body?.password === "string") {
      const {name, password} = body
      try {
        const user = await new User({name, password}).save()
        session.user = {
          id: user._id.toJSON(),
          name
        }
        await session.save()
        res.json({
          id: session.user.id
        })
      } catch {
        res.status(409).json({err: "Choose Another Username"})
      }
    } else {
      res.status(400).json({err: '"name" and "password" fields must be strings'})
    }
  }
})