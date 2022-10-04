// Server
import {isValidObjectId} from "mongoose"

import {withSessionSsr} from "@/lib/withSession"
import {Poll} from "@/lib/mongooseController"


export const getServerSideProps = withSessionSsr(async({req: {session}, params}) => {
  let id = params?.id

  if (Array.isArray(id)) {
    id = id[0]
  }

  if (!id || !isValidObjectId(id)) {
    return {
      notFound: true
    }
  }

  const props = await Poll.findById(id).select("-_id -answers.createdAt -answers.updatedAt -updatedAt").populate("author", "name").lean<{[key: string]: any}>()

  if (!props) {
    if (session.votes?.[id]) {
      delete session.votes[id]
      await session.save()
    }
    return {
      notFound: true
    }
  }

  props.author._id = props.author._id.toJSON()
  props.createdAt = props.createdAt.toJSON()
  if (props.closed) {
    props.closed = props.closed.toJSON()
  }
  for (const answer of props.answers) {
    if (answer.author) {
      answer.author = answer.author.toJSON()
    }
  }

  return {props}
})



// Client
import {useRouter} from "next/router"
import MyPoll from "@/components/Poll"

import type {PollProps} from "@/components/Poll"


export default function PollPage(props: Omit<PollProps, "_id" | "afterDelete">) {
  const router = useRouter()

  function returnHome() {
    router.push("/")
  }

  return router.query.id && (
    <main className="flex justify-center mt-8 mx-1 mb-12">
      <MyPoll {...props} _id={Array.isArray(router.query.id) ? router.query.id[0] : router.query.id} afterDelete={returnHome}/>
    </main>
  )
}
