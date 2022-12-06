// Server
import { isValidObjectId } from "mongoose"
import { User } from "@/lib/mongooseController"
import type { GetServerSideProps } from "next"


// FETCH USER DATA
export const getServerSideProps: GetServerSideProps = async({ params }) => {
  let id = params?.id

  if (Array.isArray(id)) {
    id = id[0]
  }

  if (!id || !isValidObjectId(id)) {
    return {
      notFound: true
    }
  }

  const user = await User.findById(id, "-password -updatedAt").lean()

  if (!user) {
    return {
      notFound: true
    }
  }

  // Certain data types like Date or undefined need to be parsed as a string, number or null; that's why I used `JSON.parse(JSON.stringify(...))`
  const props = JSON.parse(JSON.stringify(user))

  props.key = id  // VERY IMPORTANT! PREVENTS NEXT.JS FROM NOT RE-RENDER IN THE SAME ROUTE

  return { props }
}




// Client
import { memo, useState, useMemo, useEffect, useCallback } from "react"
import useSWRInfinite from "swr/infinite"
import { CalendarDaysIcon, ExclamationCircleIcon, ChevronDoubleDownIcon } from "@heroicons/react/24/solid"

import fetchJson from "@/lib/fetchJson"

import MyPoll from "@/components/Poll"
import Spinner from "@/components/Spinner"

import type { PollProps } from "@/components/Poll"



type FetchedPolls = {
  data: PollProps[]
  next: boolean
} | {
  err: string
}



// CUSTOM FETCHER TO TRANSFORM JSON DATE STRING TO DATE
function fetcher(input: RequestInfo | URL, init?: RequestInit) {
  return fetchJson(input, init).then((page: FetchedPolls) => {
    if ("data" in page) {
      page.data.forEach(poll => {
        if (poll.closed) poll.closed = new Date(poll.closed)
        poll.createdAt = new Date(poll.createdAt)
      })
    }

    return page
  })
}



const Page = memo(function Page({ data, author, afterDelete }: {
  data: Omit<PollProps, "author">[]
  author: PollProps["author"]
  afterDelete?: PollProps["afterDelete"]
}) {
  return <>
    {data.length ? data.map(poll => (
      <MyPoll key={poll._id} author={author} afterDelete={afterDelete} {...poll} />
    )) : (
      <p className="text-xl text-center italic underline">Page Empty</p>
    )}
  </>
})



export default function UserPage({ _id, name, createdAt: createdAtProp }: {
  _id: string
  name: string
  createdAt: string
}) {
  const author = useMemo(() => ({ _id, name }), [_id, name]),
        //
        [createdAt, setCreatedAt] = useState<string>(),
        //
        { data: pages, mutate: mutatePolls, setSize, isValidating } = useSWRInfinite((pageIndex, previousPage: FetchedPolls) => {
          let input = `/api/user/${_id}/polls`
          if (previousPage && !("err" in previousPage)) {
            if (!previousPage.next) {
              return null
            }
            const lastPollDate = previousPage.data?.at(-1)?.createdAt
            if (lastPollDate) {
              input += `?before=${lastPollDate.toJSON()}`
            }
          }
          return input
        }, fetcher)
  
  
  useEffect(() => {
    setCreatedAt(new Date(createdAtProp).toLocaleDateString())
  }, [createdAtProp])

  
  const afterDelete = useCallback(async() => {
    await mutatePolls()
  }, [mutatePolls])


  return (
    <main className="relative mt-6 mb-12">
      <section className="flex flex-col items-center gap-4 text-center mx-3">
        <h1 className="text-3xl sm:text-4xl leading-7 font-medium italic break-all">
          @{name}
        </h1>
        <p>
          <CalendarDaysIcon className="inline align-top w-6 mr-2" />Joined {createdAt}
        </p>
      </section>
      <section className="flex flex-col items-center gap-5 mx-1 mt-6">
        {pages?.map((page, i) => {
          return "err" in page ? (
            <p className="flex gap-2 items-center justify-center text-2xl font-medium italic">
              ERROR<ExclamationCircleIcon className="w-8 text-red-700" />
            </p>
          ) : (
            <Page key={i} data={page.data} author={author} afterDelete={afterDelete} />
          )
        })}
      </section>
      {isValidating ? (
        <Spinner className="w-10 text-center text-slate-400 mt-8 mx-auto" />
      ) : (
        // @ts-ignore -- It's unnecessary to check an object type with optional chaining
        pages?.at(-1)?.next && (
          <button type="button" onClick={() => setSize(size => size + 1)} disabled={isValidating} className="transition block bg-cyan-800 text-slate-100 font-medium px-3 py-2 rounded-3xl shadow-lg mt-8 mx-auto hover:bg-cyan-700 focus:ring-4">
            <ChevronDoubleDownIcon className="w-5 inline-block mr-1.5 animate-bounce" />Load More
          </button>
        )
      )}
    </main>
  )
}