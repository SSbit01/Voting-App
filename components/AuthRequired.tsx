import {memo} from "react"
import Link from "next/link"
import {CommandLineIcon, UserPlusIcon, HomeIcon} from "@heroicons/react/24/solid"
import {ExclamationCircleIcon, ArrowLeftOnRectangleIcon} from "@heroicons/react/24/outline"

import useUser from "@/lib/useUser"

import {useModal} from "@/components/Context"
import Spinner from "@/components/Spinner"


const NotLoggedIn = memo(function NotLoggedIn() {
  const modal = useModal()

  return (
    <main className="grid justify-center gap-7 text-center mt-7 mx-4">
      <h1 className="text-slate-900 text-3xl font-medium">You must be logged in to access this page</h1>
      <section className="grid gap-4 divide-y divide-slate-400">
        <div className="grid gap-2">
          {[{
            onClick() {
              modal({type: "login"})
            },
            jsx: (
              <>
                <ArrowLeftOnRectangleIcon className="w-6"/>Log In
              </>
            )
          }, {
            onClick() {
              modal({type: "signup"})
            },
            jsx: (
              <>
                <UserPlusIcon className="w-6"/>Sign Up
              </>
            )
          }].map(({onClick, jsx}, i) => (
            <button key={i} onClick={onClick} className="flex items-center justify-center gap-1.5 bg-white enabled:text-teal-600 font-semibold p-1.5 border enabled:border-teal-600 rounded float-right transition enabled:hover:bg-teal-600 enabled:hover:text-white focus:ring-4 disabled:cursor-not-allowed">
              {jsx}
            </button>
          ))}
        </div>
        <div className="pt-4">
          <Link href="/" className="flex items-center justify-center gap-1.5 bg-white text-cyan-700 font-semibold p-1 border border-cyan-700 rounded transition hover:bg-cyan-700 hover:text-white focus:ring-4">
            <HomeIcon className="w-6"/>Go to Home
          </Link>
        </div>
      </section>
    </main>
  )
})


export default function AuthRequired({children}: {
  children: JSX.Element
}) {
  const {user, isLoading, isError} = useUser()

  if (isLoading) return <Spinner className="w-12 mx-auto my-8 text-gray-300"/>

  if (isError) {
    console.error(isError)
    return (
      <main className="text-center text-slate-800 mt-7 mx-4">
        <h1 className="flex gap-2 items-center justify-center text-3xl font-medium italic">
          ERROR<ExclamationCircleIcon className="w-8 text-red-700"/>
        </h1>
        <h2 className="mt-2">Open the <CommandLineIcon className="inline align-text-bottom text-slate-700 w-5 mr-1"/>Console for more details</h2>
      </main>
    )
  }

  return user.id ? children : <NotLoggedIn/>
}
