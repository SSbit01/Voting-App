import { withSessionRoute } from "@/lib/withSession"
import { User } from "@/lib/mongooseController"


export default withSessionRoute(async({ session }, res) => {
  if (!session.user || !(await User.exists({ _id: session.user?.id }))) {   // IT ALSO CHECKS IN MONGODB IF USER EXISTS, TO PREVENT USER IN OTHER CLIENTS TO LOG IN
    session.user = {}
    await session.save()
  }
  
  res.json(session.user)
})