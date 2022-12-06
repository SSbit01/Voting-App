import { withSessionRoute } from "@/lib/withSession"
import { Poll } from "@/lib/mongooseController"




export default withSessionRoute(async({ method, session: { user }, body }, res) => {

  if (!user?.id) {
    return res.status(401).json({ err: "Unauthorized" })
  }



  switch(method) {
    case "POST":
      if (typeof body?.question !== "string") {
        return res.status(400).json({ err: '"question" field must be a string' })
      }


      if (!Array.isArray(body?.answers)) {
        return res.status(400).json({ err: '"answers" field must be an array' })
      }


      const { question, answers }: {
        question: string
        answers: string[]
      } = body


      try {

        const { _id } = await new Poll({
          author: user.id,
          question: question.trim(),
          answers: Array.from(new Set(answers)).flatMap(value => {
            value = value.trim()
            return value ? { value } : []
          })
        }).save()

        return res.json({ id: _id.toJSON() })  // SUCCESS
      
      } catch {
        return res.status(500).json({ err: "Poll could not be created" })
      }
    
    
    case "DELETE":
      try {
        return res.json(await Poll.deleteMany({ author: user.id }))  // SUCCESS
      } catch {
        return res.status(500).json({ err: "An error occurred" })
      }
  }
})
