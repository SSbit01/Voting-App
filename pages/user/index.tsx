import { memo, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useForm, FormProvider } from "react-hook-form"
import { Dialog } from "@headlessui/react"
import { CogIcon, ArrowPathIcon, TrashIcon } from "@heroicons/react/24/solid"
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"
import { ArrowLeftIcon, UserCircleIcon, ExclamationTriangleIcon, CheckIcon } from "@heroicons/react/20/solid"

import useUser from "@/lib/useUser"
import fetchJson from "@/lib/fetchJson"

import { useModal } from "@/components/Context"
import AuthRequired from "@/components/AuthRequired"
import { NameField, PasswordField, SubmitForm } from "@/components/FormFields"



const Settings = memo(function Settings() {
  const router = useRouter(),
        //
        { user, mutateUser } = useUser(),
        //
        methods = useForm({
          mode: "onChange",
          defaultValues: {
            name: user.name,
            password: ""
          }
        }),
        { handleSubmit, reset, formState: { isSubmitting, isSubmitted } } = methods,
        //
        modal = useModal()
  
  
  useEffect(() => {
    if (isSubmitted) {
      reset()
    }
  }, [isSubmitted, reset])
  

  const updateAccount = handleSubmit(async(data) => {
    for (const i in data) {
      if (["", user[i as keyof typeof user]].includes(data[i as keyof typeof data])) {
        delete data[i as keyof typeof data]
      }
    }

    const { err }: { err?: string } = await fetchJson(`/api/user/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    
    if (err) {
      modal({ type: "Alert", children: (
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
        reset({ name, password: "" })
      }
      modal({ type: "Alert", children: (
        <Dialog.Title className="flex flex-wrap items-center justify-center gap-x-1.5 text-2xl text-center">
          <CheckIcon className="w-7 text-green-700" />Account successfully updated
        </Dialog.Title>
      )})
    }
  })


  function logOut() {
    modal({ type: "LogOut" })
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
      type: "Alert",
      children: (
        <>
          <p className="text-center text-teal-100 bg-slate-900 py-1 px-4 rounded-t-lg shadow -mt-3 -mx-3 mb-2.5">
            @{user.name}
          </p>
          <Dialog.Title className="text-xl sm:text-2xl text-center">
            Are you sure you want to <strong className="text-red-700">delete your account</strong>?
          </Dialog.Title>
        </>
      ),
      async confirm() {
        const cookie: {} | { err: string } = await fetchJson(`/api/user/${user.id}`, {
          method: "DELETE"
        })

        return async() => {
          if ("err" in cookie) {
            modal({ type: "Alert", children: (
              <Dialog.Title className="text-2xl text-center">
                {cookie.err}
              </Dialog.Title>
            )})
          } else {
            mutateUser(cookie, false)
            await router.push("/")  // When user is mutating closes modals, so awaiting for the route change prevents this
            modal({ type: "Alert", children: (
              <Dialog.Title className="text-2xl text-center">
                Your account has been successfully <strong className="text-red-700">deleted</strong>
              </Dialog.Title>
            )})
          }
        }
      }
    })
  }


  return (
    <main className="relative pt-6">
      <Link href={`/user/${user.id}`} title="Profile" className="transition flex items-center gap-1.5 absolute top-3 left-3 bg-cyan-800 text-white text-center font-medium px-2 py-1.5 rounded-3xl shadow hover:bg-cyan-700 focus:ring-4">
        <ArrowLeftIcon className="w-4 text-teal-500" />
        <UserCircleIcon className="w-6 text-teal-100" />
        <span className="hidden md:inline-block italic">Profile</span>
      </Link>
      <h1 className="flex items-center justify-center gap-1 text-4xl font-medium italic mb-2">
        <CogIcon className="w-12 text-slate-700"/>Settings
      </h1>
      <div className="mx-2">
        <FormProvider {...methods}>
          <form onSubmit={updateAccount} className="grid gap-4 max-w-xl mx-auto">
            <NameField />
            <PasswordField repeat />
            <SubmitForm>
              <span className="flex items-center justify-center gap-2">
                <ArrowPathIcon className="w-6"/>Update Account
              </span>
            </SubmitForm>
          </form>
        </FormProvider>
        <section className="max-w-xl bg-slate-100 border border-red-700 rounded mx-auto my-10">
          <h2 className="bg-red-700 flex items-center justify-center gap-2 text-xl text-slate-100 italic p-1.5">
            <ExclamationTriangleIcon className="w-7" />Danger Zone
          </h2>
          <div className="grid gap-2 p-3">
            <button type="button" disabled={isSubmitting} onClick={logOut} className="flex justify-center items-center gap-1.5 bg-white enabled:text-orange-600 font-semibold p-1.5 border enabled:border-orange-600 ring-orange-300 rounded float-right transition enabled:hover:bg-orange-600 enabled:hover:text-white focus:ring-4 disabled:cursor-not-allowed">
              <ArrowRightOnRectangleIcon className="w-6" />Log Out
            </button>
            <button type="button" disabled={isSubmitting} onClick={deleteAccount} className="flex items-center justify-center gap-1.5 bg-white enabled:text-red-500 font-semibold p-1.5 border enabled:border-red-500 ring-red-300 rounded transition enabled:hover:bg-red-500 enabled:hover:text-white focus:ring-4 disabled:cursor-not-allowed">
              <TrashIcon className="w-6" />Delete My Account
            </button>
          </div>
        </section>
      </div>
    </main>
  )
})


export default function SettingsPage() {
  return (
    <AuthRequired>
      <Settings />
    </AuthRequired>
  )
}