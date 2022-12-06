import { withSessionRoute } from "@/lib/withSession"


export default withSessionRoute(async({ session }, res) => {
  if (!session.votes) {
    session.votes = {}
    await session.save()
  }
  
  res.json(session.votes)
})