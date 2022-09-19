// Server
import {isValidObjectId} from "mongoose"
import {User} from "@/lib/mongooseController"
import type {GetServerSideProps} from "next"



export const getServerSideProps: GetServerSideProps = async({params: {id}}) => {
  if (!isValidObjectId(id)) {
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
import {useState, useMemo, useEffect, useCallback} from "react"
import {Dialog} from "@headlessui/react"
import {AtSymbolIcon, CalendarIcon} from "@heroicons/react/24/outline"

import fetchJson from "@/lib/fetchJson"

import {useModal} from "@/components/Context"
import MyPoll from "@/components/Poll"
import Spinner from "@/components/Spinner"

import type {PollProps} from "@/components/Poll"



export default function UserPage({_id, name, createdAt: createdAtProp}: {
  _id: string
  name: string
  createdAt: string
}) {
  const author = useMemo(() => ({_id, name}), [_id, name]),
        //
        [createdAt, setCreatedAt] = useState<string>(),
        [polls, setPolls] = useState<PollProps[]>([]),
        [isLoading, setIsLoading] = useState(true),
        [next, setNext] = useState(true),
        //
        modal = useModal()

  
  useEffect(() => {
    setCreatedAt(new Date(createdAtProp).toLocaleDateString())
  }, [createdAtProp])


  useEffect(() => {
    if (isLoading) {
      const abortController = new AbortController()

      let input = `/api/user/${_id}/polls`
      const lastPollDate = polls.at(-1)?.createdAt
      if (lastPollDate) {
        input += `?before=${lastPollDate}`
      }
      
      fetchJson<{
        data: PollProps[]
        next?: boolean
      } | {
        err: string
      }>(input, {
        signal: abortController.signal
      }).then(res => {
        if ("err" in res) {
          modal({type: "alert", message: (
            <Dialog.Title className="text-center text-2xl">
              {res.err}
            </Dialog.Title>
          )})
        } else if ("data" in res && Array.isArray(res.data)) {
          setPolls(prevPolls => prevPolls.concat(res.data))
          if ("next" in res) {
            setNext(Boolean(res.next))
          }
        }
        setIsLoading(false)
      }).catch(console.error)
      
      return () => {
        abortController.abort()
        setIsLoading(false)
      }
    }
  }, [isLoading, _id, modal, polls])

  
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
    <main className="relative mt-6 mx-4 mb-12">
      <section className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-medium italic">
          <AtSymbolIcon className="inline align-bottom w-8"/>{name}
        </h1>
        <p>
          <CalendarIcon className="inline align-top w-6 mr-2"/>Joined {createdAt}
        </p>
      </section>
      <section className="flex flex-wrap items-start justify-center gap-6 mt-6">
        {polls.length ? polls.map(data => (
          <MyPoll key={data._id} author={author} afterDelete={afterDelete} {...data}/>
        )) : (
          <p className="text-xl italic">No Polls yet...</p>
        )}
      </section>
      <div className="flex justify-center mt-6">
        {next && (isLoading ? (
          <Spinner className="w-10 text-slate-400"/>
        ) : (
          <button onClick={() => setIsLoading(true)} disabled={isLoading} className="transition bg-teal-800 text-slate-100 font-medium px-3 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-teal-700 active:scale-95 focus:bg-teal-600 focus:shadow-cyan-500/50">Load More</button>
        ))}
      </div>
    </main>
  )
}