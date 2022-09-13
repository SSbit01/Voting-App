import {NextApiRequest, NextApiResponse} from "next"
import {isValidObjectId} from "mongoose"

import {Poll} from "@/lib/mongooseController"


export default async function getUserPollsApi({query: {id: userId, before, limit = "15"}}: NextApiRequest, res: NextApiResponse) {
  if (!isValidObjectId(userId)) {
    res.status(422).json({err: "Invalid user _id"})
  } else {
    try {
      if (Array.isArray(before)) {
        before = before[0]
      }

      const beforeParsed = Date.parse(before),
            query = {
              author: userId,
              ...beforeParsed && {
                createdAt: {
                  $lt: beforeParsed
                }
              }
            },
            maxDocs = +limit,
            //
            json = {
              data: await Poll.find(query).select("-author -answers.createdAt -answers.updatedAt -updatedAt").sort("-createdAt").limit(maxDocs).lean(),
              next: true
            }

      if (json.data.length < maxDocs || (await Poll.count(query)) <= maxDocs) {
        json.next = false
      }

      res.json(json)
    } catch {
      res.status(500).json({err: "An error occurred"})
    }
  }
}