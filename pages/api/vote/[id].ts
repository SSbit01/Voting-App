import {isValidObjectId} from "mongoose"

import {withSessionRoute} from "@/lib/withSession"
import {Poll} from "@/lib/mongooseController"


export default withSessionRoute(async({session, query: {id, answer}}, res) => {
  if (Array.isArray(id)) id = id[0]
  if (Array.isArray(answer)) answer = answer[0]

  if (!id || !isValidObjectId(id)) {
    res.status(422).json({err: "Invalid _id"})
  } else if (session.votes?.[id]) {
    res.status(403).json({err: "You have already voted in this poll"})
  } else if (answer) {
    try {
      const {modifiedCount} = await Poll.updateOne({
        _id: id,
        closed: {$exists: false},
        "answers.value": answer,
        ...session.user?.id && {"answers.author": {$ne: session.user.id}}
      }, {
        $inc: {
          "answers.$.votes": 1
        }
      })
      if (modifiedCount) {
        if (!session.votes) {
          session.votes = {}
        }
        session.votes[id] = answer
        await session.save()
        res.json({})
      } else {
        res.status(404).json({err: "Not Found"})
      }
    } catch {
      res.status(500).json({err: "An error occurred"})
    }
  } else {
    res.status(400).json({err: '"answer" field required'})
  }
})