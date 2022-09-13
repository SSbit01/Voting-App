import {createContext, useReducer, useContext} from "react"
import {SignUp, LogIn, LogOut, Alert} from "@/components/Modal"

import type {Dispatch, ReactNode} from "react"
import type {ConfirmFunction} from "@/components/Modal"


type ModalState = {
  type?: string
  message?: ReactNode
  confirm?: ConfirmFunction
}


const SIGNUP = "signup",
      LOGIN = "login",
      LOGOUT = "logout",
      ALERT = "alert"


function modalReducer(
  state: ModalState,
  {type, message, confirm}: ModalState = {}
): ModalState {
  switch(type) {
    case SIGNUP:
      return {type: SIGNUP}
    case LOGIN:
      return {type: LOGIN}
    case LOGOUT:
      return {type: LOGOUT}
    case ALERT:
      return {type: ALERT, message, confirm}
    default:
      delete state.type
      return {...state}
  }
}


const ModalContext = createContext<Dispatch<ModalState>>(
  () => void 0
)


export default function AppWrapper({children}: {
  children: ReactNode
}) {
  const [modalState, modalDispatch] = useReducer(modalReducer, {})

  return (
    <ModalContext.Provider value={modalDispatch}>
      {children}
      <SignUp show={modalState.type === SIGNUP} onClose={modalDispatch}/>
      <LogIn show={modalState.type === LOGIN} onClose={modalDispatch}/>
      <LogOut show={modalState.type === LOGOUT} onClose={modalDispatch}/>
      <Alert show={modalState.type === ALERT} onClose={modalDispatch} confirm={modalState.confirm}>
        {modalState.message}
      </Alert>
    </ModalContext.Provider>
  )
}


export function useModal() {
  return useContext(ModalContext)
}