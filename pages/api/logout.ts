import {withSessionRoute} from "@/lib/withSession"

export default withSessionRoute(async({session}, res) => {
  session.user = {}
  await session.save()
  res.json(session.user)
})
