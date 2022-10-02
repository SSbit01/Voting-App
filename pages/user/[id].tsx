// Server
import {isValidObjectId} from "mongoose"
import {User} from "@/lib/mongooseController"
import type {GetServerSideProps} from "next"



export const getServerSideProps: GetServerSideProps = async({params}) => {
  let id = params?.id

  if (Array.isArray(id)) {
    id = id[0]
  }

  if (!id || !isValidObjectId(id)) {
    return {
      notFound: true
    }
  }

  const props = await User.findById(id, "-password -updatedAt").lean<{[key: string]: any}>()

  if (!props) {
    return {
      notFound: true
    }
  }
  
  props._id = props._id.toJSON()
  props.createdAt = props.createdAt.toJSON()

  return {props}
}




// Client
import {memo, useState, useMemo, useEffect, useCallback} from "react"
import useSWRInfinite from "swr/infinite"
import {AtSymbolIcon, CalendarIcon} from "@heroicons/react/24/outline"

import MyPoll from "@/components/Poll"
import Spinner from "@/components/Spinner"

import type {PollProps} from "@/components/Poll"



type FetchedPolls = {
  data: PollProps[]
  next: boolean
  err?: boolean
}



const Page = memo(function Page({data, author, afterDelete}: {
  data: PollProps[]
  author: PollProps["author"]
  afterDelete?: PollProps["afterDelete"]
}) {
  return <>
    {data.map(poll => (
      <MyPoll key={poll._id} author={author} afterDelete={afterDelete} {...poll}/>
    ))}
  </>
})



export default function UserPage({_id, name, createdAt: createdAtProp}: {
  _id: string
  name: string
  createdAt: string
}) {
  const author = useMemo(() => ({_id, name}), [_id, name]),
        //
        [createdAt, setCreatedAt] = useState<string>(),
        {data: polls, mutate: mutatePolls, setSize, isValidating} = useSWRInfinite<FetchedPolls>((pageIndex, previousPage) => {
          let input = `/api/user/${_id}/polls`
          if (previousPage && !("err" in previousPage)) {
            if (!previousPage.next) {
              return null
            }
            const lastPollDate = previousPage.data?.at(-1)?.createdAt
            if (lastPollDate) {
              input += `?before=${lastPollDate}`
            }
          }
          return input
        })
  
  
  useEffect(() => {
    setCreatedAt(new Date(createdAtProp).toLocaleDateString())
  }, [createdAtProp])

  
  const afterDelete = useCallback(async() => {
    await mutatePolls()
  }, [mutatePolls])


  return (
    <main className="relative mt-6 mx-4 mb-12">
      <section className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-medium italic">
          <AtSymbolIcon className="inline align-bottom w-8"/>{name}
        </h1>
        <p>
          <CalendarIcon className="inline align-top w-6 mr-2"/>Joined {createdAt}
        </p>
      </section>
      {polls?.at(-1)?.data?.length ? (
        <section className="flex flex-wrap items-start justify-center gap-6 mt-6">
          {polls.map(({data}, i) => <Page key={i} data={data} author={author} afterDelete={afterDelete}/>)}
        </section>
      ) : !isValidating && (
        <p className="text-xl text-center italic mt-4">No Polls yet...</p>
      )}
      <div className="flex justify-center mt-6">
        {isValidating ? (
          <Spinner className="w-10 text-slate-400"/>
        ) : polls?.at(-1)?.next && (
          <button onClick={() => setSize(size => size + 1)} disabled={isValidating} className="transition bg-teal-800 text-slate-100 font-medium px-3 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-teal-700 active:scale-95 focus:bg-teal-600 focus:shadow-cyan-500/50">Load More</button>
        )}
      </div>
    </main>
  )
}