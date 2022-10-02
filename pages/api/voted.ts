import {isValidObjectId} from "mongoose"

import {withSessionRoute} from "@/lib/withSession"
import {Poll} from "@/lib/mongooseController"


export default withSessionRoute(async({session}, res) => {
  if (session.votes) {

    try {

      const deleteVotes: string[] = [],
            votesKeys = Object.keys(session.votes).filter(i => {
              if (isValidObjectId(i)) return true
              deleteVotes.push(i)
            }),
            polls = await Poll.find({_id: {$in: votesKeys}}).select("-answers.createdAt -answers.updatedAt -updatedAt").populate("author", "name").sort("-createdAt").lean()

      for (const i of votesKeys) {
        if (!polls.some(({_id}) => _id.toString() === i)) {
          deleteVotes.push(i)
        }
      }
      
      if (deleteVotes.length) {
        for (const i of deleteVotes) {
          delete session.votes[i]
        }
        await session.save()
      }

      res.json(polls)

    } catch {
      res.status(500).json({err: "An error occurred"})
    }

  } else {
    session.votes = {}
    await session.save()
    res.json([])
  }
})