// SERVER
import {isValidObjectId} from "mongoose"

import {withSessionSsr} from "@/lib/withSession"
import {Poll} from "@/lib/mongooseController"


export const getServerSideProps = withSessionSsr(async({req: {session}}) => {
  if (!session.votes) {
    session.votes = {}
    await session.save()
  }

  const deleteVotes: string[] = [],
        votesKeys = Object.keys(session.votes).filter(i => {
          if (isValidObjectId(i)) return true
          deleteVotes.push(i)
        }),
        polls = await Poll.find({_id: {$in: votesKeys}}).select("-answers.createdAt -answers.updatedAt -updatedAt").populate("author", "name").lean<Array<{[key: string]: any}>>()

  for (const i of polls) {
    i._id = i._id.toJSON()
    i.author._id = i.author._id.toString()
    i.createdAt = i.createdAt.toJSON()
    if (i.closed) {
      i.closed = i.closed.toJSON()
    }
    for (const answer of i.answers) {
      if (answer.author) {
        answer.author = answer.author.toJSON()
      }
    }
  }

  for (const i of votesKeys) {
    if (!polls.some(({_id}) => _id === i)) {
      deleteVotes.push(i)
    }
  }
  
  if (deleteVotes.length) {
    for (const i of deleteVotes) {
      delete session.votes[i]
    }
    await session.save()
  }

  return {
    props: {polls}
  }
})




// CLIENT
import {useState, useCallback} from "react"
import MyPoll from "@/components/Poll"


export default function VotedPage({polls: pollsProp}) {
  const [polls, setPolls] = useState(pollsProp)

  const afterDelete = useCallback((pollId: string) => {
    setPolls(prevPolls => {
      for (let i = 0; i < prevPolls.length; i++) {
        if (pollId == prevPolls[i]._id) {
          prevPolls.splice(i, 1)
        }
      }
      return [...prevPolls]
    })
  }, [])

  return (
    <main className="flex flex-col items-center justify-center gap-6 mt-7 mx-3 mb-12">
      <h1 className="text-4xl font-medium text-center italic">Voted Polls</h1>
      <section className="flex flex-wrap items-start justify-center gap-6 w-full">
        {polls.length ? polls.map((data, i) => (
          <MyPoll key={data._id} afterDelete={afterDelete} {...data}/>
        )) : (
          <h2 className="text-xl -mb-1">You haven&apos;t voted in any polls yet!</h2>
        )}
      </section>
    </main>
  )
}