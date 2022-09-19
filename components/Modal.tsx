import {memo, useState, useCallback, Fragment} from "react"
import {useForm, FormProvider} from "react-hook-form"
import {Transition, Dialog} from "@headlessui/react"
import {UserPlusIcon} from "@heroicons/react/24/solid"
import {ArrowLeftOnRectangleIcon} from "@heroicons/react/24/outline"
import {XCircleIcon} from "@heroicons/react/20/solid"

import fetchJson from "@/lib/fetchJson"
import useUser from "@/lib/useUser"

import {NameField, PasswordField, SubmitForm} from "@/components/FormFields"
import Spinner from "@/components/Spinner"

import type {ReactNode} from "react"


const CloseModalButton = memo(function CloseModalButton({onClick, disabled = false}: {
  onClick(): any
  disabled: boolean
}) {
  return (
    <button type="button" onClick={onClick} className="absolute top-1.5 right-1.5 transition-colors enabled:cursor-pointer enabled:text-rose-700 enabled:hover:text-rose-600 disabled:text-red-900 disabled:cursor-not-allowed" disabled={disabled}>
      <XCircleIcon className="w-7"/>
    </button>
  )
})


interface ModalProps {
  show: boolean
  onClose(): void
}

export type ReturnConfirmFunction = void | (() => any)
export type ConfirmFunction = () => Promise<ReturnConfirmFunction> | ReturnConfirmFunction


const Modal = memo(function Modal({
  show,
  onClose,
  afterLeave,
  className = "relative bg-slate-300 p-4 rounded-lg border border-slate-500 shadow m-auto",
  children
}: ModalProps & {
  afterLeave(): void
  className?: string
  children: ReactNode
}) {
  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Dialog onClose={onClose} className="fixed inset-0 z-50 bg-black/40 flex overflow-auto p-4 backdrop-blur-sm" aria-hidden="true">
        <Transition.Child
          as={Fragment}
          enter="transition-transform duration-300"
          enterFrom="scale-95"
          enterTo="scale-100"
          leave="transition-transform duration-300"
          leaveFrom="scale-100"
          leaveTo="scale-95"
          afterLeave={afterLeave}
        >
          <Dialog.Panel className={className}>
            {children}
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
})


export default Modal


export const SignUp = memo(function SignUp({show, onClose}: ModalProps) {
  const methods = useForm({
          mode: "onChange",
          defaultValues: {
            name: "",
            password: ""
          }
        }),
        {handleSubmit, setError, reset, formState: {isSubmitting}} = methods,
        //
        {mutateUser} = useUser()
    
  const closeModal = useCallback(() => {
    if (!isSubmitting) {
      onClose()
    }
  }, [isSubmitting, onClose])
  
  const onSubmit = handleSubmit(async function onSubmit(data) {
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      switch(res.status) {
        case 200:
          res.json().then(({id}) => {
            mutateUser({
              id,
              name: data.name
            })
            closeModal()
          })
          break
        case 409:
          setError("name", {
            message: "Choose Another"
          }, {
            shouldFocus: true
          })
      }
    } catch(err) {
      alert(err)
      throw err
    }
  })

  return (
    <Modal show={show} onClose={closeModal} afterLeave={reset}>
      <Dialog.Title className="text-2xl text-center font-bold italic text-slate-700 mb-2.5">Sign Up</Dialog.Title>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="grid gap-4">
          <NameField/>
          <PasswordField required="Required" repeat/>
          <SubmitForm>
            <span className="flex gap-2 justify-center">
              <UserPlusIcon className="w-6"/>Create Account
            </span>
          </SubmitForm>
        </form>
      </FormProvider>
      <CloseModalButton onClick={closeModal} disabled={isSubmitting}/>
    </Modal>
  )
})


export const Alert = memo(function Alert({show, onClose, children, confirm}: ModalProps & {
  children: ReactNode
  confirm?: ConfirmFunction
}) {
  const [disabled, setDisabled] = useState(false),
        [runAfterLeave, setRunAfterLeave] = useState<Function>()
  
  const closeModal = useCallback(() => {
    if (!disabled) {
      onClose()
    }
  }, [disabled, onClose])

  const afterLeave = useCallback(() => {
    setDisabled(false)
    if (runAfterLeave) {
      runAfterLeave()
      setRunAfterLeave(() => void 0)
    }
  }, [runAfterLeave])

  return (
    <Modal show={show} onClose={closeModal} afterLeave={afterLeave}>
      {children}
      {disabled ? (
        <p className="bg-slate-700 text-white text-center font-medium p-2 rounded-b-md mt-4 -mb-4 -mx-4">
          <Spinner/>
          Processing...
        </p>
      ) : (
        <div className="flex mt-4">
          {confirm && (
            <button type="button" onClick={async() => {
              setDisabled(true)
              const afterLeaveFunc = await confirm?.()
              if (afterLeaveFunc) {
                setRunAfterLeave(() => afterLeaveFunc)
              }
              onClose()
            }} className="flex-1 transition bg-sky-800 text-white text-center font-bold p-2 first:rounded-bl last:rounded-br first:-mb-4 first:-ml-4 last:-mb-4 last:-mr-4 shadow-lg enabled:cursor-pointer enabled:hover:bg-sky-700 enabled:focus:bg-sky-600 enabled:focus:shadow-cyan-500/50 disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed">Yes</button>
          )}
          <button type="button" onClick={onClose} className="flex-1 transition bg-slate-800 text-white text-center font-bold p-2 first:rounded-bl last:rounded-br first:-mb-4 first:-ml-4 last:-mb-4 last:-mr-4 shadow-lg enabled:cursor-pointer enabled:hover:bg-slate-700 enabled:focus:bg-slate-600 enabled:focus:shadow-cyan-900/50 disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed">
            {confirm ? "Cancel" : "Ok"}
          </button>
        </div>
      )}
    </Modal>
  )
})


export const LogIn = memo(function LogIn({show, onClose}: ModalProps) {
  const methods = useForm({
          mode: "onChange",
          defaultValues: {
            name: "",
            password: ""
          }
        }),
        {handleSubmit, setError, reset, formState: {isSubmitting}} = methods,
        {mutateUser} = useUser()
  
  function closeModal() {
    if (!isSubmitting) {
      onClose()
    }
  }

  const onSubmit = handleSubmit(async(data) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      switch(res.status) {
        case 200:
          res.json().then(({id}) => {
            mutateUser({
              id,
              name: data.name
            })
            closeModal()
          })
          break
        case 401:
          setError("password", {
            message: "Incorrect"
          }, {
            shouldFocus: true
          })
          break
        case 404:
          setError("name", {
            message: "Not Found"
          }, {
            shouldFocus: true
          })
      }
    } catch(err) {
      alert(err)
      throw err
    }
  })

  return (
    <Modal show={show} onClose={closeModal} afterLeave={reset}>
      <Dialog.Title className="text-2xl text-center font-bold italic text-slate-700 mb-2.5">Log In</Dialog.Title>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="grid gap-4">
          <NameField/>
          <PasswordField required="Required"/>
          <SubmitForm>
            <span className="flex gap-2 justify-center">
              <ArrowLeftOnRectangleIcon className="w-6"/>Sign In
            </span>
          </SubmitForm>
        </form>
      </FormProvider>
      <CloseModalButton onClick={closeModal} disabled={isSubmitting}/>
    </Modal>
  )
})


export const LogOut = memo(function LogOut({show, onClose}: ModalProps) {
  const {mutateUser} = useUser()

  async function logOut() {
    try {
      mutateUser(await fetchJson<{}>("/api/logout"), false)
    } catch {
      alert("An error occurred")
    }
    onClose()
  }

  return (
    <Alert show={show} onClose={onClose} confirm={logOut}>
      <Dialog.Title className="text-2xl text-center">
        Are you sure you want to <strong className="text-red-700">Log Out</strong>?
      </Dialog.Title>
    </Alert>
  )
})