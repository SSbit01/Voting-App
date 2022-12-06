// Server
import { isValidObjectId } from "mongoose"

import { withSessionSsr } from "@/lib/withSession"
import { Poll } from "@/lib/mongooseController"


export const getServerSideProps = withSessionSsr(async({ req: { session }, params }) => {
  let id = params?.id

  if (Array.isArray(id)) {
    id = id[0]
  }

  if (!id || !isValidObjectId(id)) {
    return {
      notFound: true
    }
  }

  const poll = await Poll.findById(id).select("-_id -answers.createdAt -answers.updatedAt -updatedAt").populate("author", "name").lean()

  if (!poll) {
    if (session.votes) {
      if (session.votes[id]) {
        delete session.votes[id]
        await session.save()
      }
    } else {
      session.votes = {}
      await session.save()
    }
    return {
      notFound: true
    }
  }

  const props = JSON.parse(JSON.stringify(poll))  // Certain data types like Date or undefined need to be parsed as a string, number or null; that's why I used `JSON.parse(JSON.stringify(...))`

  props.key = id  // VERY IMPORTANT! PREVENTS NEXT.JS FROM NOT RE-RENDER IN THE SAME ROUTE

  return { props }
})



// Client
import { useRouter } from "next/router"
import MyPoll from "@/components/Poll"

import type { PollJson } from "@/components/Poll"


export default function PollPage({ question, author, closed, answers, createdAt }: Omit<PollJson, "_id">) {
  const router = useRouter()

  function returnHome() {
    router.push("/")
  }

  return router.query.id && (
    <main className="flex justify-center mt-8 mx-1 mb-12">
      <MyPoll
        _id={Array.isArray(router.query.id) ? router.query.id[0] : router.query.id}
        question={question}
        author={author}
        closed={closed ? new Date(closed) : undefined}
        answers={answers}
        createdAt={new Date(createdAt)}
        afterDelete={returnHome}
      />
    </main>
  )
}
