import { NextApiRequest, NextApiResponse } from "next"
import { isValidObjectId } from "mongoose"

import { Poll } from "@/lib/mongooseController"



export default async function getUserPollsApi({ query: { id: userId, before, limit = "10" } }: NextApiRequest, res: NextApiResponse) {
  if (!isValidObjectId(userId)) {
    return res.status(422).json({ err: "Invalid user _id" })
  }

  
  try {
    if (Array.isArray(before)) {
      before = before[0]
    }

    const query = {
            author: userId,
            ...before && {
              createdAt: {
                $lt: before
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

    return res.json(json)  // SUCCESS

  } catch {
    return res.status(500).json({ err: "An error occurred" })
  }
}