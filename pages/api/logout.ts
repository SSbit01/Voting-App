import {withSessionRoute} from "@/lib/withSession"

export default withSessionRoute(async({session}, res) => {
  session.user = {}
  await session.save()
  res.setHeader("cache-control", "no-store, max-age=0")
  res.json(session.user)
})
