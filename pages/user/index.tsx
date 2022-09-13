import {useState, useEffect} from "react"
import {useRouter} from "next/router"
import Link from "next/link"
import {useForm, FormProvider} from "react-hook-form"
import {Dialog} from "@headlessui/react"
import {CogIcon, ArrowPathIcon, TrashIcon} from "@heroicons/react/24/solid"
import {ArrowRightOnRectangleIcon} from "@heroicons/react/24/outline"
import {ArrowLeftIcon, UserCircleIcon, ExclamationTriangleIcon} from "@heroicons/react/20/solid"

import useUser from "@/lib/useUser"
import fetchJson from "@/lib/fetchJson"

import {useModal} from "@/components/Context"
import AuthRequired from "@/components/AuthRequired"
import {NameField, PasswordField, SubmitForm} from "@/components/FormFields"



function Settings() {
  const router = useRouter(),
        //
        {user, mutateUser} = useUser(),
        //
        methods = useForm({
          mode: "onChange",
          defaultValues: {
            name: user.name,
            password: ""
          }
        }),
        {handleSubmit, reset, formState: {isSubmitting, isSubmitted}} = methods,
        //
        modal = useModal()
  
  
  useEffect(() => {
    if (isSubmitted) {
      reset()
    }
  }, [isSubmitted, reset])
  

  const updateAccount = handleSubmit(async(data) => {
    for (const i in data) {
      if (["", user[i]].includes(data[i])) {
        delete data[i]
      }
    }

    const {err} = await fetchJson<{err?: string}>(`/api/user/${user.id}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    })
    
    if (err) {
      modal({type: "alert", message: (
        <Dialog.Title className="text-2xl text-center">
          {err}
        </Dialog.Title>
      )})
    } else {
      const {name} = data
      if (name) {
        mutateUser({
          ...user,
          name
        })
        reset({name, password: ""})
      }
      modal({type: "alert", message: (
        <Dialog.Title className="text-2xl text-center">
          Account successfully updated
        </Dialog.Title>
      )})
    }
  })


  function logOut() {
    modal({type: "logout"})
  }


  /*function deleteAllPolls() {
    modal({
      type: "alert",
      message: (
        <Dialog.Title className="text-2xl text-center">
          Are you sure you want to <strong className="text-red-700">delete your polls</strong>?
        </Dialog.Title>
      ),
      async confirm() {

        const {err} = await fetchJson<{err?: string}>(`/api/poll`, {
          method: "DELETE"
        })

        if (err) {
          return () => modal({type: "alert", message: (
            <Dialog.Title className="text-2xl text-center">
              {err}
            </Dialog.Title>
          )})
        }

        setPollsDeleted(true)

        return () => modal({type: "alert", message: (
          <Dialog.Title className="text-2xl text-center">
            Your polls have been successfully <strong className="text-red-700">deleted</strong>
          </Dialog.Title>
        )})
      }
    })
  }*/


  function deleteAccount() {
    modal({
      type: "alert",
      message: (
        <Dialog.Title className="text-2xl text-center">
          Are you sure you want to <strong className="text-red-700">delete your account</strong>?
        </Dialog.Title>
      ),
      async confirm() {
        const cookie = await fetchJson<{} | {err: string}>(`/api/user/${user.id}`, {
          method: "DELETE"
        })

        return "err" in cookie ? () => modal({type: "alert", message: (
          <Dialog.Title className="text-2xl text-center">
            {cookie.err}
          </Dialog.Title>
        )}) : () => {
          mutateUser(cookie, false)
          router.push("/")
          modal({type: "alert", message: (
            <Dialog.Title className="text-2xl text-center">
              Your account has been successfully <strong className="text-red-700">deleted</strong>
            </Dialog.Title>
          )})
        }
      }
    })
  }


  return (
    <main className="relative pt-6">
      <Link href={`/user/${user.id}`}>
        <a title="Profile" className="transition flex items-center gap-1.5 absolute top-3 left-3 bg-cyan-800 text-white text-center font-medium px-2 py-1.5 rounded-md shadow hover:bg-cyan-700 active:scale-95 focus:bg-cyan-600 focus:shadow-cyan-500/50">
          <ArrowLeftIcon className="w-4"/>
          <UserCircleIcon className="w-6"/>
          <span className="hidden md:inline-block italic">Profile</span>
        </a>
      </Link>
      <div className="max-w-lg mx-auto">
        <h1 className="flex items-center justify-center gap-2 text-4xl font-medium italic mb-2">
          <CogIcon className="w-12 text-slate-700"/>Settings
        </h1>
        <FormProvider {...methods}>
          <form onSubmit={updateAccount} className="grid gap-4 p-2">
            <NameField/>
            <PasswordField repeat/>
            <SubmitForm>
              <span className="flex items-center justify-center gap-2">
                <ArrowPathIcon className="w-6"/>Update Account
              </span>
            </SubmitForm>
          </form>
        </FormProvider>
        <section className="bg-slate-100 border border-red-700 rounded mx-2 my-10">
          <h2 className="bg-red-700 flex items-center justify-center gap-2 text-xl text-slate-100 italic p-1.5">
            <ExclamationTriangleIcon className="w-7"/>Danger Zone
          </h2>
          <div className="grid gap-2 p-3">
            <button type="button" onClick={logOut} className="flex justify-center items-center gap-1.5 bg-white enabled:text-orange-600 font-semibold p-1.5 border enabled:border-orange-600 rounded float-right transition enabled:hover:bg-orange-600 enabled:hover:text-white focus:ring-4 disabled:cursor-not-allowed">
              <ArrowRightOnRectangleIcon className="w-6"/>Log Out
            </button>
            <button type="button" disabled={isSubmitting} onClick={deleteAccount} className="flex items-center justify-center gap-1.5 bg-white enabled:text-red-500 font-semibold p-1.5 border enabled:border-red-500 rounded transition enabled:hover:bg-red-500 enabled:hover:text-white focus:ring-4 disabled:cursor-not-allowed">
              <TrashIcon className="w-6"/>Delete My Account
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}


export default function SettingsPage() {
  return (
    <AuthRequired>
      <Settings/>
    </AuthRequired>
  )
}