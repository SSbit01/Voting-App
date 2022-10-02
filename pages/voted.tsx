import {useCallback} from "react"
import useSWR from "swr"
import {ExclamationCircleIcon} from "@heroicons/react/24/outline"

import MyPoll from "@/components/Poll"
import Spinner from "@/components/Spinner"

import type {PollProps} from "@/components/Poll"


export default function VotedPage() {
  const {data, error, mutate} = useSWR<PollProps[]>("/api/voted")

  const afterDelete = useCallback((pollId: string) => {
    mutate(prevPolls => {
      if (prevPolls) {
        for (let i = 0; i < prevPolls.length; i++) {
          if (pollId == prevPolls[i]._id) {
            prevPolls.splice(i, 1)
            return prevPolls
          }
        }
      }
    })
  }, [mutate])

  return (
    <main className="flex flex-col items-center justify-center gap-6 mt-7 mx-3 mb-12">
      <h1 className="text-4xl font-medium text-center italic">Voted Polls</h1>
      <section className="flex flex-wrap items-start justify-center gap-6 w-full">
        {error ? (
          <h1 className="flex gap-2 items-center justify-center text-3xl font-medium italic">
            ERROR<ExclamationCircleIcon className="w-8 text-red-700"/>
          </h1>
        ) : data ? (data.length ? data.map(poll => (
          <MyPoll key={poll._id} afterDelete={afterDelete} {...poll}/>
        )) : (
          <h2 className="text-xl text-center -mb-1">You haven&apos;t voted in any polls yet!</h2>
        )) : (
          <Spinner className="w-10 text-slate-400"/>
        )}
      </section>
    </main>
  )
}