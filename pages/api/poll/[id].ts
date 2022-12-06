import { isValidObjectId } from "mongoose"

import { withSessionRoute } from "@/lib/withSession"
import { Poll } from "@/lib/mongooseController"




export default withSessionRoute(async({ method, session, body, query: { id: _id } }, res) => {

  if (Array.isArray(_id)) _id = _id[0]


  if (!_id || !isValidObjectId(_id)) {
    return res.status(422).json({ err: "Invalid _id" })
  }
  
  
  if (!session.user?.id) {
    return res.status(401).json({ err: "Unauthorized, you must be logged in. Request canceled" })
  }

  

  switch(method) {
      
    case "POST":

      if (typeof body?.answer !== "string") {
        return res.status(400).json({ err: '"answer" field must be a string' })
      }

      body.answer = body.answer.trim()

      if (!body.answer) {
        return res.status(400).json({ err: '"answer" field is empty' })
      }

      try {

        const { modifiedCount } = await Poll.updateOne({
          _id,
          closed: { $exists: false },
          "answers.author": { $ne: session.user.id },
          "answers.value": { $ne: body.answer }
        }, {
          $push: {
            answers: {
              value: body.answer,
              votes: 1,
              author: session.user.id
            }
          }
        })

        if (!modifiedCount) {
          return res.status(404).json({ err: "Not Found" })
        }

        if (!session.votes?.[_id]) {
          if (!session.votes) {
            session.votes = {}
          }
          session.votes[_id] = body.answer
          await session.save()
        }

        return res.json({})  // SUCCESS

      } catch(err) {
        return res.status(500).json({ err: "An error occurred" })
      }
    
    
    case "PATCH":
      try {

        const closed = new Date(),
              { modifiedCount } = await Poll.updateOne({
                _id,
                author: session.user.id,
                closed: { $exists: false }
              }, { closed })
        
        if (!modifiedCount) {
          return res.status(404).json({ err: "Not Found" })
        }

        return res.json({ closed })  // SUCCESS

      } catch {
        return res.status(500).json({ err: "An error occurred" })
      }
    
    
    case "DELETE":
      try {
        const { deletedCount } = await Poll.deleteOne({
          _id,
          author: session.user.id
        })

        if (!deletedCount) {
          return res.status(404).json({ err: "Not Found" })
        }

        return res.json({})  // SUCCESS

      } catch {
        return res.status(500).json({ err: "An error occurred" })
      }
  }
})