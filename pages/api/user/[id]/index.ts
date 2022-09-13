import {isValidObjectId} from "mongoose"

import {withSessionRoute} from "@/lib/withSession"
import {User, Poll} from "@/lib/mongooseController"


export default withSessionRoute(async({body, method, session, query: {id: userId}}, res) => {
  if (!isValidObjectId(userId)) {
    res.status(422).json({err: "Invalid _id"})
  } else if (session.user?.id == userId) {

    switch(method) {

      case "PATCH":
        if (body && typeof body === "object" && !Array.isArray(body)) {
          let bodyLength = Object.keys(body).length
          if (bodyLength) {
            try {
              const user = await User.findById(userId)
              if (user) {
                if (body.password && user.comparePassword(body.password)) {
                  delete body.password
                  bodyLength--
                }
                if (bodyLength) {
                  for (const i in body) {
                    user[i] = body[i]
                  }
                  await user.save()
                  if (body.name && body.name != session.user.name) {
                    session.user.name = body.name
                    await session.save()
                  }
                  res.json({}) 
                } else {
                  res.status(400).json({err: "Only your old password was supplied"})
                }
              } else {
                res.status(404).json({err: "Not Found"})
              }
            } catch(err) {
              if (err?.keyPattern?.name) {
                res.status(409).json({err: "This username is already taken"})
              } else {
                res.status(500).json({err: "An error occurred"})
              }
            }
          } else {
            res.status(400).json({err: "No fields were supplied"})
          }
        } else {
          res.status(400).json({err: "Body is not an object"})
        }
        break
      
      case "DELETE":
        try {
          await Promise.all([
            Poll.deleteMany({author: userId}),
            User.deleteOne({_id: userId})
          ])
          session.user = {}
          await session.save()
          res.json(session.user)
        } catch {
          res.status(500).json({err: "An error occurred"})
        }
    
    }
  } else {
    res.status(401).json({err: "Unauthorized. Request canceled"})
  }
})