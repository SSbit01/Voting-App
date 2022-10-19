import {isValidObjectId} from "mongoose"

import {withSessionRoute} from "@/lib/withSession"
import {Poll} from "@/lib/mongooseController"



export default withSessionRoute(async({method, session, body, query: {id}}, res) => {
  if (Array.isArray(id)) id = id[0]


  if (!id || !isValidObjectId(id)) {
    res.status(422).json({err: "Invalid _id"})
  } else if (session.user?.id) {

    switch(method) {
      
      case "POST":
        if (typeof body?.answer === "string") {
          body.answer = body.answer.trim()
          if (body.answer) {
            try {
              const {modifiedCount} = await Poll.updateOne({
                _id: id,
                closed: {$exists: false},
                "answers.author": {$ne: session.user.id},
                "answers.value": {$ne: body.answer}
              }, {
                $push: {
                  answers: {
                    value: body.answer,
                    votes: 1,
                    author: session.user.id
                  }
                }
              })
              if (modifiedCount) {
                if (!session.votes?.[id]) {
                  if (!session.votes) {
                    session.votes = {}
                  }
                  session.votes[id] = body.answer
                  await session.save()
                }
                res.json({})
              } else {
                res.status(404).json({err: "Not Found"})
              }
            } catch(err) {
              res.status(500).json({err: "An error occurred"})
            }
          } else {
            res.json({err: '"answer" field is empty'})
          }
        } else {
          res.json({err: '"answer" field must be a string'})
        }
        break
      
      case "PATCH":
        try {
          const closed = new Date(),
                {modifiedCount} = await Poll.updateOne({
                  _id: id,
                  author: session.user.id,
                  closed: {$exists: false}
                }, {closed})
          if (modifiedCount) {
            res.json({closed})
          } else {
            res.status(404).json({err: "Not Found"})
          }
        } catch {
          res.status(500).json({err: "An error occurred"})
        }
        break
      
      case "DELETE":
        try {
          const {deletedCount} = await Poll.deleteOne({
            _id: id,
            author: session.user.id
          })
          if (deletedCount) {
            res.json({})
          } else {
            res.status(404).json({err: "Not Found"})
          }
        } catch {
          res.status(500).json({err: "An error occurred"})
        }
    }

  } else {
    res.status(401).json({err: "Unauthorized, you must be logged in. Request canceled"})
  }
})