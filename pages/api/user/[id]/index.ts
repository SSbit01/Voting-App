import { isValidObjectId } from "mongoose"

import { withSessionRoute } from "@/lib/withSession"
import { User, Poll } from "@/lib/mongooseController"




export default withSessionRoute(async({ body, method, session, query: { id: userId } }, res) => {

  if (!isValidObjectId(userId)) {
    return res.status(422).json({ err: "Invalid _id" })
  }


  
  if (!session.user || session.user.id !== userId) {
    return res.status(401).json({ err: "Unauthorized. Request canceled" })
  }



  switch(method) {

    case "PATCH":
      
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({ err: "Body is not an object" })
      }


      if (!["name", "password"].some(field => field in body)) {
        return res.status(400).json({ err: "No valid fields were supplied" })
      }


      try {

        const user = await User.findById(userId)

        if (!user) {
          return res.status(404).json({ err: "Not Found" })
        }

        if (typeof body.name === "string") {
          user.name = body.name
        }

        if (typeof body.password === "string" && !user.comparePassword(body.password)) {
          user.password = body.password
        }

        if (!user.isModified()) {
          return res.status(400).json({ err: "Account not updated" })
        }

        await user.save()

        if (user.name !== session.user.name) {
          session.user.name = user.name
          await session.save()
        }
        
        return res.json({})  // SUCCESS

      } catch(err: any) {

        if (err?.keyPattern?.name) {
          return res.status(409).json({ err: "This username is already taken" })
        }

        return res.status(500).json({ err: "An error occurred" })
      }
    
    
    
    case "DELETE":
      try {

        await Promise.all([
          Poll.deleteMany({ author: userId }),
          User.deleteOne({ _id: userId })
        ])

        session.user = {}
        await session.save()

        return res.json(session.user)  // SUCCESS

      } catch {
        return res.status(500).json({ err: "An error occurred" })
      }
  
  }
})