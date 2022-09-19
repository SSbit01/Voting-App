import {memo, useState, useEffect, useMemo, Fragment} from "react"
import Link from "next/link"
import clsx from "clsx"
import {useForm, FormProvider} from "react-hook-form"
import {ErrorMessage} from "@hookform/error-message"
import {Dialog, Menu, Transition} from "@headlessui/react"
import {UserPlusIcon, CursorArrowRaysIcon, ChartBarIcon, TrashIcon, LockClosedIcon, ArrowLeftOnRectangleIcon} from "@heroicons/react/24/solid"
import {ShareIcon} from "@heroicons/react/24/outline"
import {AtSymbolIcon, EllipsisVerticalIcon, CheckBadgeIcon, ExclamationTriangleIcon} from "@heroicons/react/20/solid"

import useUser from "@/lib/useUser"
import useVotes from "@/lib/useVotes"
import fetchJson from "@/lib/fetchJson"
import {answerField} from "@/lib/attributes"

import {cookieDisabledState, useModal} from "@/components/Context"
import {SubmitForm} from "@/components/FormFields"

import type {Dispatch, SetStateAction} from "react"



type UseState<T> = [T, Dispatch<SetStateAction<T>>]

type DisabledState = UseState<boolean>

type AnswersState = UseState<Answer[]>


export interface Answer {
  value: string
  votes: number
  author?: string
}

export interface PollProps {
  _id: string
  question: string
  author?: {
    _id: string
    name: string
  }
  closed?: string
  answers: Answer[]
  createdAt: string
  afterDelete?: (id: string) => any
}



const AnswerResult = memo(function AnswerResult({value, votes, totalVotes, isMyVote}: Answer & {
  totalVotes: number
  isMyVote?: boolean
}) {
  const percentage = 100 * (votes / totalVotes) || 0

  return (
    <div className="relative" title={isMyVote ? "My Vote" : undefined}>
      <div className={`absolute z-0 h-full rounded shadow ${isMyVote ? "bg-cyan-300 border border-slate-400" : "bg-cyan-500"}`} style={{
        width: `${percentage}%`
      }}/>
      <p className="flex items-center gap-2.5 relative m-1.5">
        <strong className="text-right min-w-[2.6em]">{Math.round(percentage)}%</strong>
        <span className="mr-2" style={{
          overflowWrap: "anywhere"
        }}>{value}</span>
        <span className="flex gap-2.5 ml-auto">
          {isMyVote && (
            <CheckBadgeIcon className="w-6"/>
          )}
          <em className="break-normal text-slate-700">{votes} vote(s)</em>
        </span>
      </p>
    </div>
  )
})



const Results = memo(function Results({answers, answerVoted, closedDate}: {
  answers: Answer[]
  answerVoted?: Answer["value"]
  closedDate?: PollProps["closed"]
}) {
  const originalAnswers = useMemo(() => answers.filter(({author}) => !author), [answers]),
        extraAnswers = useMemo(() => answers.filter(({author}) => author), [answers]),
        //
        totalVotes = useMemo(() => Object.values(answers).reduce((total, {votes}) => total + votes, 0), [answers])


  function renderAnswerResult({value, votes}: Answer, i: number) {
    return <AnswerResult key={i} value={value} votes={votes} totalVotes={totalVotes} isMyVote={answerVoted == value}/>
  }


  return (
    <div className="grid gap-3">
      <div className="flex gap-2 flex-wrap">
        <p><strong>{totalVotes}</strong> vote{totalVotes != 1 && "s"}</p>
        {closedDate && (
          <p className="flex items-center gap-1.5 flex-wrap text-sm font-light pl-1.5 border-l border-slate-500">
            <LockClosedIcon className="w-3"/>Final results<i>({closedDate})</i>
          </p>
        )}
      </div>
      {Boolean(originalAnswers.length) && (
        <fieldset className="grid gap-1.5 p-2 border border-cyan-600 rounded">
          <legend className="flex gap-1 px-1 -mb-1 italic">
            <CursorArrowRaysIcon className="w-5 text-cyan-900"/>Original Answers
          </legend>
          {originalAnswers.map(renderAnswerResult)}
        </fieldset>
      )}
      {Boolean(extraAnswers.length) && (
        <fieldset className="grid gap-1.5 p-2 border border-cyan-600 rounded">
          <legend className="flex gap-1 px-1 -mb-1 italic cursor-help" title="These answers were added by other users">
            <CursorArrowRaysIcon className="w-5 text-cyan-900"/>Extra Answers
          </legend>
          {extraAnswers.map(renderAnswerResult)}
        </fieldset>
      )}
    </div>
  )
})



const Options = memo(function Options({_id, afterDelete, disabled, answers, isVoted, closedState: [closedDate, setClosedDate]}: {
  _id: PollProps["_id"]
  closedState: UseState<PollProps["closed"]>
  disabled: boolean
  answers?: Answer[]
  isVoted: boolean
  afterDelete?: PollProps["afterDelete"]
}) {
  const API = `/api/poll/${_id}`,
        modal = useModal(),
        areThereAnswers = Boolean(answers?.length)


  return (
    <Menu as="div" className="relative z-40 ml-auto -mb-1.5">
      {({open}) => (
        <>
          <Menu.Button disabled={disabled} className={clsx("rounded transition", open && "ring")}>
            <EllipsisVerticalIcon className="w-6"/>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition duration-200"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="transition"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <Menu.Items className="absolute right-0 origin-top-right divide-y divide-slate-500 bg-slate-900/75 text-slate-200 backdrop-blur-sm min-w-max w-full rounded shadow">
              {(areThereAnswers && !closedDate && !isVoted) && (
                <Menu.Item>
                  {({active}) => (
                    <button onClick={() => {
                      modal({
                        type: "alert",
                        message: (
                          <Results answers={answers}/>
                        )
                      })
                    }} className={clsx("flex items-center gap-1.5 w-full pr-3 pl-1.5 py-1 first:rounded-t last:rounded-b transition duration-150", active && "bg-sky-900")}>
                      <ChartBarIcon className="w-5"/>Results
                    </button>
                  )}
                </Menu.Item>
              )}
              {!closedDate && (
                <Menu.Item>
                  {({active}) => (
                    <button onClick={() => {
                      modal({
                        type: "alert",
                        message: (
                          <>
                            <Dialog.Title className="text-2xl text-center leading-tight">
                              Are you sure you want to <strong className="text-red-700">close this poll</strong>?
                            </Dialog.Title>
                            <div className="text-left font-thin mt-2">
                              <p className="flex gap-1">
                                <ExclamationTriangleIcon className="w-5 text-red-700"/>This cannot be undone
                              </p>
                              {!areThereAnswers && (
                                <p className="flex gap-1">
                                  <ExclamationTriangleIcon className="w-5 text-red-700"/>There are no answers!
                                </p>
                              )}
                            </div>
                          </>
                        ),
                        async confirm() {
                          const {err, closed: newClosedDate} = await fetchJson<{
                            err?: string
                            closed?: string
                          }>(API, {method: "PATCH"})
                          if (err) {
                            return () => modal({type: "alert", message: (
                              <Dialog.Title className="text-2xl text-center">
                                {err}
                              </Dialog.Title>
                            )})
                          }
                          setClosedDate(new Date(newClosedDate).toLocaleString())
                        }
                      })
                    }} className={clsx("flex items-center gap-1.5 w-full pr-3 pl-1.5 py-1 first:rounded-t last:rounded-b transition duration-150", active && "bg-slate-900")}>
                      <LockClosedIcon className="w-5"/>Close Poll
                    </button>
                  )}
                </Menu.Item>
              )}
              <Menu.Item>
                {({active}) => (
                  <button onClick={() => {
                    modal({
                      type: "alert",
                      message: (
                        <Dialog.Title className="text-2xl text-center">
                          Are you sure you want to <strong className="text-red-700">delete this poll</strong>?
                        </Dialog.Title>
                      ),
                      async confirm() {
                        const {err} = await fetchJson<{err?: string}>(API, {method: "DELETE"})
                        if (err) {
                          return () => modal({type: "alert", message: (
                            <Dialog.Title className="text-2xl">
                              {err}
                            </Dialog.Title>
                          )})
                        }
                        afterDelete?.(_id)
                        return () => modal({type: "alert", message: (
                          <Dialog.Title className="text-2xl">
                            The poll has been <strong className="text-red-700">deleted</strong>
                          </Dialog.Title>
                        )})
                      }
                    })
                  }} className={clsx("flex items-center gap-1.5 w-full pr-3 pl-1.5 py-1 first:rounded-t last:rounded-b transition duration-150", active && "bg-rose-700")}>
                    <TrashIcon className="w-5"/>Delete
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
})



const NewAnswerForm = memo(function NewAnswerForm({_id, disabledState: [disabled, setDisabled], answersState: [answers, setAnswers]}: Required<Pick<PollProps, "_id">> & {
  disabledState: DisabledState
  answersState: AnswersState
}) {
  const {user} = useUser(),
        {mutateVotes} = useVotes(),
        //
        modal = useModal(),
        //
        methods = useForm({
          mode: "onChange",
          defaultValues: {
            answer: ""
          }
        }),
        {handleSubmit, register, formState: {errors}} = methods
  
  
  const onSubmit = handleSubmit(async({answer}) => {
    setDisabled(true)

    const {err} = await fetchJson<{err?: string}>(`/api/poll/${_id}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({answer})
    })

    if (err) {
      modal({type: "alert", message: (
        <Dialog.Title className="text-2xl text-center">
          {err}
        </Dialog.Title>
      )})
      setDisabled(false)
      throw err
    }

    setAnswers(prevAnswers => ([...prevAnswers, {
      value: answer,
      votes: 1,
      author: user.id
    }]))

    mutateVotes(prevVotes => ({...prevVotes, [_id]: answer}))

    setDisabled(false)
  })


  return (
    <FormProvider {...methods}>
      <form className="grid gap-2 relative" onSubmit={onSubmit}>
        <input type="text" maxLength={answerField.maxLength} pattern={answerField.pattern.source} disabled={disabled} {...register("answer", {
          maxLength: answerField.maxLength,
          pattern: {
            value: answerField.pattern,
            message: answerField.patternMessage
          },
          validate(value) {
            if (answers.some(({value: answerValue}) => answerValue == value)) {
              return "This answer already exists"
            }
          }
        })}/>
        <ErrorMessage
          errors={errors}
          name="answer"
          render={({message}) => <p className="absolute right-0  bg-slate-900/95 text-red-600 font-bold px-2 rounded shadow">{message}</p>}
        />
        <SubmitForm disabled={disabled}>Submit New Answer</SubmitForm>
      </form>
    </FormProvider>
  )
})



const AnswerButton = memo(function AnswerButton({value, onClick}: {
  value: string
  onClick(event: {
    currentTarget: HTMLButtonElement
  }): any
}) {
  return (
    <button value={value} onClick={onClick} className="text-left bg-white enabled:text-cyan-700 font-semibold px-2.5 py-1.5 border enabled:border-cyan-500 rounded shadow transition enabled:hover:bg-cyan-600 enabled:hover:text-white focus:ring disabled:cursor-not-allowed">
      {value}
    </button>
  )
})



const NotLoggedIn = memo(function NotLoggedIn() {
  const modal = useModal()

  return (
    <div>
      <p className="flex flex-wrap gap-1 items-center justify-center text-center text-lg">
        <ExclamationTriangleIcon className="w-7 text-yellow-500"/>You must be logged in to create a new answer
      </p>
      <div className="grid gap-2 mt-3">
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
    </div>
  )
})



const SelectAnswer = memo(function SelectAnswer(props: Required<Pick<PollProps, "_id">> & {
  disabledState: DisabledState
  answersState: AnswersState
  authorId?: PollProps["author"]["_id"]
}) {
  const {authorId, ...restProps} = props,
        {_id, answersState: [answers, setAnswers], disabledState: [disabled, setDisabled]} = restProps,
        //
        {mutateVotes} = useVotes(),
        //
        {user} = useUser(),
        modal = useModal(),
        //
        originalAnswers = useMemo(() => answers.filter(({author}) => !author), [answers]),
        extraAnswers = useMemo(() => answers.filter(({author}) => author), [answers])


  async function onClick({currentTarget: {value}}: {
    currentTarget: HTMLButtonElement
  }) {
    if (navigator.cookieEnabled) {
      setDisabled(true)
      
      try {
        const {err} = await fetchJson<{err?: string}>(`/api/vote/${_id}?answer=${value}`)
        if (err) {
          throw err
        }
        setAnswers(prevAnswers => {
          prevAnswers.find(({value: v}) => v === value).votes++
          return [...prevAnswers]
        })
        mutateVotes(prevVotes => ({...prevVotes, [_id]: value}))
      } catch(err) {
        modal({type: "alert", message: (
          <Dialog.Title className="text-2xl text-center">
            {err}
          </Dialog.Title>
        )})
      }

      setDisabled(false)
    } else {
      modal(cookieDisabledState)
    }
  }


  function renderAnswerButton({value}: Answer, i: number) {
    return (
      <AnswerButton key={i} value={value} onClick={onClick}/>
    )
  }


  return (
    <div className="grid gap-4">
      {Boolean(originalAnswers.length) && (
        <fieldset disabled={disabled} className="p-2 border border-cyan-600 rounded">
          <legend className="flex gap-1 px-1 -mb-1 italic">
            <CursorArrowRaysIcon className="w-5 text-cyan-900"/>Original Answers
          </legend>
          <div className="grid gap-1.5">
            {originalAnswers.map(renderAnswerButton)}
          </div>
        </fieldset>
      )}
      <fieldset disabled={disabled} className="p-2 border border-cyan-600 rounded empty:hidden">
        <legend className="flex gap-1 px-1 -mb-1 italic cursor-help" title="These answers were added by other users">
          <CursorArrowRaysIcon className="w-5 text-cyan-900"/>Extra Answers
        </legend>
        <div className="grid gap-1.5 mb-3 empty:hidden">
          {extraAnswers.map(renderAnswerButton)}
        </div>
        {user.id ? (
          authorId === user.id ? (                                                
            <p className="font-light text-center">Authors cannot create new answers</p>
          ) : <NewAnswerForm {...restProps}/>
        ) : <NotLoggedIn/>}
      </fieldset>
    </div>
  )
})



const CreatedAt = memo(function CreatedAt({createdAt}: {
  createdAt: PollProps["createdAt"]
}) {
  const [createdAtString, setCreatedAtString] = useState<string>()

  useEffect(() => {
    if (!createdAtString) {
      setCreatedAtString(new Date(createdAt).toLocaleString())
    }
  }, [createdAt, createdAtString])

  return <p className="italic text-sm">{createdAtString}</p>
})



const ShareButton = memo(function ShareButton({_id}: Pick<PollProps, "_id">) {
  const [showShare, setShowShare] = useState(false)

  useEffect(() => {
    if (!showShare && navigator?.canShare) {
      setShowShare(true)
    }
  }, [showShare])

  return showShare && (
    <div className="text-right">
      <button className="transition align-bottom focus:ring rounded-sm text-slate-600 hover:text-slate-700" onClick={() => {
        navigator.share({
          url: window.location.origin + `/poll/${_id}`
        })
      }}>
        <ShareIcon className="w-6"/>
      </button>
    </div>
  )
})



export default memo(function MyPoll({_id, question, author, createdAt, closed: pollClosed, answers: answersProp, afterDelete}: PollProps) {
  const disabledState = useState(false),
        closedState = useState<string>(),
        answersState = useState(answersProp),
        //
        [closedDate, setClosedDate] = closedState,
        [answers] = answersState,
        //
        {user} = useUser(),
        {myVotes} = useVotes(),
        //
        answerCreatedByUser = useMemo(() => (user?.id && answers.find(({author: authorId}) => authorId == user.id)?.value), [user, answers]),
        answerVoted = useMemo(() => answerCreatedByUser || myVotes[_id], [_id, myVotes, answerCreatedByUser])

  
  useEffect(() => {
    if (pollClosed && !closedDate) {
      setClosedDate(new Date(pollClosed).toLocaleString())
    }
  }, [pollClosed, closedDate, setClosedDate])


  return (
    <article title={closedDate ? "Closed" : undefined} className="grid gap-4 relative z-0 max-w-prose bg-slate-50 w-full p-3 border border-slate-400 rounded-lg shadow" style={{
      overflowWrap: "anywhere"
    }}>

      <div className="flex">
        {author?.name && (
          <Link href={`/user/${author._id}`}>
            <a className="transition font-medium italic underline-offset-1 hover:underline text-slate-600 focus:text-slate-800">
              <AtSymbolIcon className="inline align-middle w-4"/>{author.name}
            </a>
          </Link>
        )}
        {(author?._id && user.id === author._id) && <Options _id={_id} afterDelete={afterDelete} closedState={closedState} disabled={disabledState[0]} answers={answers} isVoted={Boolean(answerVoted)}/>}
      </div>

      <h1 className="text-2xl font-semibold text-cyan-800 mx-2 -mt-2">
        {question}
      </h1>

      {(answerVoted || closedDate) ? <Results answers={answers} answerVoted={answerVoted} closedDate={closedDate}/> : <SelectAnswer _id={_id} authorId={author?._id} answersState={answersState} disabledState={disabledState}/>}

      <div className="flex items-end justify-between mt-2">
        <CreatedAt createdAt={createdAt}/>
        <ShareButton _id={_id}/>
      </div>

      <p className="text-center bg-slate-800 rounded-b-lg p-1 -mt-1 -mb-3 -mx-3">
        <Link href={`/poll/${_id}`}>
          <a className="text-cyan-600 font-medium hover:underline">
            {_id}
          </a>
        </Link>
      </p>

      {closedDate && (
        <LockClosedIcon className="absolute right-0 z-[-1] max-h-[90%] text-slate-200 drop-shadow-md"/>
      )}

    </article>
  )
})