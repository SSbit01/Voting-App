import {withSessionRoute} from "@/lib/withSession"
import {Poll} from "@/lib/mongooseController"

export default withSessionRoute(async({method, session: {user}, body}, res) => {
  if (user?.id) {
    switch(method) {
      case "POST":
        if (typeof body?.question === "string" && Array.isArray(body?.answers)) {
          const {question, answers}: {
            question: string
            answers: string[]
          } = body
          try {
            const {_id} = await new Poll({
              author: user.id,
              question: question.trim(),
              answers: Array.from(new Set(answers)).flatMap(value => {
                value = value.trim()
                console.log(value)
                return value ? { value } : []
              })
            }).save()
            res.json({id: _id.toJSON()})
          } catch {
            res.status(500).json({err: "Poll could not be created"})
          }
        } else {
          res.status(400).json({err: '"question" field must be a string and "answers" field must be an array'})
        }
        break
      case "DELETE":
        try {
          res.json(await Poll.deleteMany({author: user.id}))
        } catch {
          res.status(500).json({err: "An error occurred"})
        }
    }
  } else {
    res.status(401).json({err: "Unauthorized"})
  }
})
