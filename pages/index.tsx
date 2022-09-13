import Image from "next/image"
import Link from "next/link"

import {useModal} from "@/components/Context"

import useUser from "@/lib/useUser"


function AccountInstruction({actionClassName = ""}) {
  const modal = useModal()
  
  return (
    <li><span className={actionClassName} onClick={() => modal({type: "login"})}>Log In</span> into your account, or <span className={actionClassName} onClick={() => modal({type: "signup"})}>create one</span>.</li>
  )
}


export default function HomePage() {
  const logoSize = 64,
        actionClassName = "transition font-medium text-sky-800 cursor-pointer hover:underline",
        //
        {user} = useUser()

  return (
    <main className="grid items-center justify-center gap-8 mt-8 mx-3 mb-12">
      <h1 className="text-5xl text-center font-semibold italic select-none drop-shadow">
        <Image src="/vercel.svg" alt="Logo" width={logoSize} height={logoSize}/><span className="-ml-2.5">oting</span> App
      </h1>
      <section className="md:text-lg lg:text-xl bg-slate-100 divide-y divide-slate-400 px-3 border border-slate-400 rounded-md shadow shadow-slate-400">
        {
          [
            {
              header: "What is this?",
              content: <p>This is a <a href="https://nextjs.org" target="_blank" rel="noreferrer" className={actionClassName}>Next.js</a> platform created by <a href="https://github.com/SSbit01"  target="_blank" rel="noreferrer" className={actionClassName}>SSbit01</a> where users can create polls and everyone can vote on them.</p>
            },
            {
              header: "How can I create a poll?",
              content: (
                <>
                  <p>Authenticated users can create polls and share them with anyone:</p>
                  <ol role="list" className="marker:text-sky-900 marker:font-semibold list-decimal space-y-2 leading-tight pl-5 sm:pl-10 mt-2">
                    {!user.id && <AccountInstruction actionClassName={actionClassName}/>}
                    <li>Go to the <Link href="/poll"><a className={actionClassName}>/poll</a></Link> page to create a new poll.</li>
                    <li>The poll is now created, share it with your friends!</li>
                    <li>Other authenticated users can create new answers to your poll.</li>
                    <li>You can close your poll whenever you want.</li>
                  </ol>
                </>
              )
            },
            {
              header: "Is this project Open Source?",
              content: (
                <>
                  <p>Yes! It&apos;s a free and open source project released under the <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank" rel="noreferrer" className={actionClassName}>GPLv3 License</a>.</p>
                  <p className="mt-1.5">
                    <a href="https://github.com/SSbit01/voting-app" target="_blank" rel="noreferrer" className={actionClassName}>
                      <svg viewBox="0 0 16 16" className="inline-block align-sub w-5 mr-1.5" fill="currentColor" aria-hidden="true">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                      Repository
                    </a>
                  </p>
                </>
              )
            }
          ].map(({header, content}, i) => (
            <article key={i} className="py-3">
              <h2 className="text-2xl font-semibold italic mb-1">{header}</h2>
              {content}
            </article>
          ))
        }
      </section>
    </main>
  )
}