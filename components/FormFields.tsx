import {useRef} from "react"
import {useFormContext, useFieldArray} from "react-hook-form"
import {ErrorMessage} from "@hookform/error-message"
import {UserIcon, LockClosedIcon, QuestionMarkCircleIcon, CursorArrowRaysIcon} from "@heroicons/react/24/solid"
import {PlusIcon, MinusIcon} from "@heroicons/react/20/solid"


import {nameField, passwordField, questionField, answerField} from "@/lib/attributes"

import Spinner from "@/components/Spinner"

import type {ReactNode} from "react"
import type {RegisterOptions} from "react-hook-form"



export function NameField() {
  const NAME = "name",
        {maxLength, pattern} = nameField,
        //
        {register, formState} = useFormContext(),
        {errors, isSubmitting, isSubmitSuccessful} = formState

  return (
    <fieldset disabled={isSubmitting || isSubmitSuccessful} className={`grid gap-1 relative pt-1 px-2 pb-2 border rounded transition-colors ${NAME in errors ? "border-red-500" : "border-cyan-600"}`}>
      <legend className="flex gap-1.5 px-1 italic">
        <UserIcon className="w-5 text-cyan-900"/>Username
      </legend>
      <input type="text" size={26} maxLength={maxLength} pattern={pattern.source} placeholder="e.g. superman" {...register(NAME, {
        maxLength,
        pattern: {
          value: pattern,
          message: "Invalid Pattern"
        },
        required: "Required"
      })}/>
      <ErrorMessage
        errors={errors}
        name={NAME}
        render={({message}) => <p className="absolute -top-6 right-3 bg-slate-900/95 text-red-600 font-bold px-2 rounded shadow">{message}</p>}
      />
    </fieldset>
  )
}


export function PasswordField({
  required = false,
  repeat = false
}: RegisterOptions & {
  repeat?: boolean
}) {
  const NAME = "password",
        {maxLength} = passwordField,
        //
        repeatPasswordRef = useRef<HTMLInputElement>(null),
        {register, trigger, formState} = useFormContext(),
        {errors, isSubmitting, isSubmitSuccessful, dirtyFields} = formState
  
  return (
    <fieldset disabled={isSubmitting || isSubmitSuccessful} className={`grid gap-1.5 relative pt-1 px-2 pb-2 border rounded transition-colors ${NAME in errors ? "border-red-500" : "border-cyan-600"}`}>
      <legend className="flex gap-1 px-1 italic">
        <LockClosedIcon className="w-5 text-cyan-900"/>Password
      </legend>
      <input type="password" placeholder="e.g. Test1234" maxLength={maxLength} {...register(NAME, {required, maxLength, validate: repeat ? function(value) {
        const repeatValue =  repeatPasswordRef.current?.value
        if (value && !repeatValue) {
          return ""
        } else if (value != repeatValue) {
          return "Not Match"
        }
       } : undefined})}/>
      {repeat && (
        <input ref={repeatPasswordRef} type="password" placeholder="Repeat password" maxLength={maxLength} disabled={!repeatPasswordRef.current?.value && !dirtyFields[NAME]} className="disabled:bg-gray-200 disabled:border-slate-400 disabled:cursor-not-allowed" onChange={() => {
          trigger(NAME)
        }}/>
      )}
      <ErrorMessage
        errors={errors}
        name={NAME}
        render={({message}) => <p className="absolute -top-6 right-3 bg-slate-900/95 text-red-600 font-bold px-2 rounded shadow">{message}</p>}
      />
    </fieldset>
  )
}


export function QuestionField({required, autoFocus}: RegisterOptions & {
  autoFocus?: boolean
}) {
  const NAME = "question",
        {maxLength} = questionField,
        //
        {register, formState} = useFormContext(),
        {errors, isSubmitting, isSubmitSuccessful} = formState

  return (
    <fieldset disabled={isSubmitting || isSubmitSuccessful} className={`grid gap-1 relative pt-1 px-2 pb-2 border rounded transition-colors ${NAME in errors ? "border-red-500" : "border-cyan-600"}`}>
      <legend className="flex gap-1.5 px-1 italic">
        <QuestionMarkCircleIcon className="w-5 text-cyan-900"/>Question
      </legend>
      <textarea maxLength={maxLength} autoFocus={autoFocus} placeholder="e.g. 'Where should we go?'" {...register(NAME, {required, maxLength})}/>
      <ErrorMessage
        errors={errors}
        name={NAME}
        render={({message}) => <p className="absolute -top-6 right-3 bg-slate-900/95 text-red-600 font-bold px-2 rounded shadow">{message}</p>}
      />
    </fieldset>
  )
}


export function AnswersField() {
  const NAME = "answers",
        {maxLength} = answerField,
        //
        {register, formState} = useFormContext(),
        {errors, isSubmitting, isSubmitSuccessful} = formState,
        {fields, append, remove} = useFieldArray({
          name: NAME,
          /*rules: {
            validate(arr) {
              arr = (arr as Array<{value: string}>).flatMap(({value}) => value || [])
              return arr.length == new Set(arr).size || "Duplicates"  // It doesn't append to "errors" array, it may be a React Hook Form bug
            }
          }*/
        })
  
  function appendInput() {
    append({value: ""})
  }

  function removeInput() {
    remove(fields.length - 1)
  }
  
  return (
    <fieldset disabled={isSubmitting || isSubmitSuccessful} className={`grid gap-1 relative pt-1 px-2 pb-2 border rounded transition-colors ${NAME in errors ? "border-red-500" : "border-cyan-600"}`}>
      <legend className="flex gap-1.5 px-1 italic">
        <CursorArrowRaysIcon className="w-5 text-cyan-900"/>Answers
      </legend>
      {fields.map((field, i) => {
        const NAME_FIELD = `${NAME}.${i}.value` as const
        return (
          <div key={field.id} className="relative">
            <input type="text" maxLength={maxLength} placeholder={`e.g. Answer ${i + 1}`} className="w-full" {...register(NAME_FIELD, {maxLength})}/>
            <ErrorMessage
              errors={errors}
              name={NAME_FIELD}
              render={({message}) => <p className="absolute -top-2 right-0 bg-slate-900/95 text-red-600 text-sm font-bold px-2 rounded shadow">{message}</p>}
            />
          </div>
        )
      })}
      <div className="flex divide-x divide-slate-500 mt-1">
        <button type="button" className="flex-1 bg-sky-800 text-white p-2 rounded-l-md shadow-lg transition enabled:cursor-pointer enabled:hover:bg-sky-700 enabled:focus:bg-sky-600 enabled:focus:shadow-cyan-500/50 disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed" onClick={appendInput}>
          <PlusIcon className="w-5 m-auto"/>
        </button>
        <button type="button" className="flex-1 bg-slate-800 text-white p-2 rounded-r-md shadow-lg transition enabled:cursor-pointer enabled:hover:bg-slate-700 enabled:focus:bg-slate-600 enabled:focus:shadow-cyan-900/50 disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed" onClick={removeInput} disabled={!fields.length}>
          <MinusIcon className="w-5 m-auto"/>
        </button>
      </div>
      <ErrorMessage
        errors={errors}
        name={NAME}
        render={({message}) => <p className="absolute -top-6 right-3 bg-slate-900/95 text-red-600 font-bold px-2 rounded shadow">{message}</p>}
      />
    </fieldset>
  )
}


export function SubmitForm({disabled, children}: {
  disabled?: boolean
  children: ReactNode
}) {
  const {formState} = useFormContext(),
        {isDirty, isValid, isSubmitting, isSubmitSuccessful} = formState

  return (
    <button type="submit" disabled={!isDirty || !isValid || isSubmitting || isSubmitSuccessful || disabled} className="transition bg-sky-800 text-white text-center font-medium p-2 rounded shadow-lg enabled:cursor-pointer enabled:hover:bg-sky-700 enabled:active:scale-95 enabled:focus:bg-sky-600 enabled:focus:shadow-cyan-500/50 disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed">
      {(isSubmitting || isSubmitSuccessful) ? (
        <>
          <Spinner/>
          Processing...
        </>
      ) : children}
    </button>
  )
}