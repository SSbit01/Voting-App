import { isValidObjectId } from "mongoose"

import { withSessionRoute } from "@/lib/withSession"
import { Poll } from "@/lib/mongooseController"



export default withSessionRoute(async({ session, query: { id, answer } }, res) => {
  if (Array.isArray(id)) id = id[0]


  if (!id || !isValidObjectId(id)) {
    return res.status(422).json({ err: "Invalid _id" })
  }


  if (session.votes?.[id]) {
    return res.status(403).json({ err: "You have already voted in this poll" })
  }


  if (Array.isArray(answer)) answer = answer[0]


  if (!answer) {
    return res.status(400).json({ err: '"answer" field required' })
  }


  try {

    const { modifiedCount } = await Poll.updateOne({
      _id: id,
      closed: { $exists: false },
      "answers.value": answer,
      ...session.user?.id && { "answers.author": { $ne: session.user.id } }
    }, {
      $inc: {
        "answers.$.votes": 1
      }
    })

    if (!modifiedCount) {
      return res.status(404).json({ err: "Not Found" })
    }

    if (!session.votes) {
      session.votes = {}
    }
    session.votes[id] = answer
    await session.save()

    return res.json({})  // SUCCESS

  } catch {
    return res.status(500).json({ err: "An error occurred" })
  }
})