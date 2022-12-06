import { withSessionRoute } from "@/lib/withSession"
import { User } from "@/lib/mongooseController"



export default withSessionRoute(async({ method, body, session }, res) => {
  if (method === "POST") {

    if (typeof body?.name !== "string" || typeof body?.password !== "string") {
      return res.status(400).json({ err: '"name" and "password" fields must be strings' })
    }


    const { name, password } = body


    try {
    
      const user = await User.findOne({ name }, "-name")
      
      if (!user) {
        return res.status(404).json({ err: "Not Found" })
      }

      if (!user.comparePassword(password)) {
        return res.status(401).json({ err: "Incorrect Password" })
      }

      session.user = {
        id: user._id.toJSON(),
        name,
      }

      await session.save()
      
      // SUCCESS
      return res.json({
        id: session.user.id
      })
    
    } catch {
      return res.status(500).json({ err: "An error occurred" })
    }
    
  }
})
