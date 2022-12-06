import { isValidObjectId } from "mongoose"

import { withSessionRoute } from "@/lib/withSession"
import { Poll } from "@/lib/mongooseController"



export default withSessionRoute(async({ session }, res) => {

  if (!session.votes) {
    session.votes = {}
    await session.save()
    
    return res.json([])
  }


  try {
    const deleteVotes: string[] = [],
          votesKeys = Object.keys(session.votes).filter(i => {
            if (isValidObjectId(i)) return true
            deleteVotes.push(i)
          }),
          polls = await Poll.find({ _id: { $in: votesKeys } }).select("-answers.createdAt -answers.updatedAt -updatedAt").populate("author", "name").sort("-createdAt").lean()

    for (const idString of votesKeys) {  // Checks if each id in votes can be found in the received polls, if not, delete that id from votes
      if (!polls.some(({ _id }) => _id.toString() === idString)) {
        deleteVotes.push(idString)
      }
    }
    
    if (deleteVotes.length) {
      for (const i of deleteVotes) {
        delete session.votes[i]
      }
      await session.save()
    }

    return res.json(polls)  // SUCCESS

  } catch {
    return res.status(500).json({ err: "An error occurred" })
  }
})