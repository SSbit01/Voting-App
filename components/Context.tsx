import { createContext, useReducer, useContext } from "react"
import { Dialog } from "@headlessui/react"

import * as Modals from "@/components/Modal"

import type { Dispatch, ReactNode } from "react"


type ModalAction = {
  [key in keyof typeof Modals]: {
    type: key
  } & Omit<Parameters<typeof Modals[key]>[0], keyof Modals.ModalProps>
}[keyof typeof Modals]  /* { type: "LogIn" } | {
  type: "Alert"
  message: string
  confirm?: Function
}... */

type ModalState = Partial<ModalAction>


export const cookieDisabledState: ModalAction = {
  type: "Alert",
  children: (<>
    <Dialog.Title className="text-2xl mb-1.5">
      Cookies Are <strong className="text-red-700">Disabled</strong>!
    </Dialog.Title>

    <Dialog.Description>
      Make sure your cookies are <u>enabled</u> and try again
    </Dialog.Description>
  </>)
}


function modalReducer(state: ModalState, action?: ModalAction): ModalState {

  if (!action || !("type" in action)) {
    if ("type" in state) {
      delete state.type
    }
    return { ...state }
  }

  if (!navigator.cookieEnabled && ["LogIn", "SignUp"].includes(action.type)) {
    return { ...cookieDisabledState }
  }

  return { ...action }
  
}


const ModalContext = createContext<Dispatch<ModalAction | void>>(() => void 0)


export default function AppWrapper({ children }: {
  children: ReactNode
}) {

  const [modalState, modalDispatch] = useReducer(modalReducer, {})

  return (
    <ModalContext.Provider value={modalDispatch}>
      {children}
      {Object.entries(Modals).map(([key, Modal], i) => {
        const { type, ...rest } = modalState
        // @ts-ignore
        return <Modal key={i} show={type === key} onClose={modalDispatch} {...rest} />
      })}
    </ModalContext.Provider>
  )
}


export function useModal() {
  return useContext(ModalContext)  // const modal = useModal() -> modal({ type: "Alert", children: <p>Test</p>... })
}