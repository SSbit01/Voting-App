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
    <main className="mt-6 mb-12">
      <h1 className="text-4xl font-medium text-center italic mx-3">Voted Polls</h1>
      <section className="flex flex-wrap items-start justify-center gap-6 mx-1 mt-6">
        {error ? (
          <h2 className="flex gap-2 items-center justify-center text-3xl font-medium italic">
            ERROR<ExclamationCircleIcon className="w-8 text-red-700"/>
          </h2>
        ) : data ? (data.length ? data.map(poll => (
          <MyPoll key={poll._id} afterDelete={afterDelete} {...poll}/>
        )) : (
          <h2 className="text-xl text-center mx-2 -mb-1">You haven&apos;t voted in any polls yet!</h2>
        )) : (
          <Spinner className="w-10 text-slate-400"/>
        )}
      </section>
    </main>
  )
}