import Link from "next/link"
import {HomeIcon} from "@heroicons/react/24/solid"

export default function Error404Page() {
  return (
    <main className="flex flex-col items-center justify-center gap-9 text-center p-5 mt-10">
      <div className="flex flex-col gap-6 sm:flex-row items-center justify-center">
        <h1 className="text-9xl sm:pr-7 sm:border-r border-slate-400"><strong>404</strong></h1>
        <p className="text-2xl">Page Not Found</p>
      </div>
      <Link href="/" className="flex justify-center gap-3 transition bg-teal-800 text-slate-100 text-xl font-medium p-3 rounded-lg shadow-lg cursor-pointer hover:bg-teal-700 focus:bg-teal-600 focus:shadow-cyan-500/50">
        <HomeIcon className="w-7"/>Go to Home
      </Link>
    </main>
  )
}