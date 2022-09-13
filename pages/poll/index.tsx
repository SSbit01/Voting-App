import {useRouter} from "next/router"
import {useForm, FormProvider} from "react-hook-form"
import {Dialog} from "@headlessui/react"
import {PlusIcon} from "@heroicons/react/20/solid"

import fetchJson from "@/lib/fetchJson"

import AuthRequired from "@/components/AuthRequired"
import {QuestionField, AnswersField, SubmitForm} from "@/components/FormFields"
import {useModal} from "@/components/Context"



function NewPoll() {
  const router = useRouter(),
        //
        methods = useForm<{
          question: string
          answers: Array<{
            value: string
          }>
        }>({
          mode: "onChange",
          defaultValues: {
            question: "",
            answers: new Array(2).fill({value: ""})
          }
        }),
        {handleSubmit} = methods,
        //
        modal = useModal()
  

  async function onSubmit({question, answers}) {
    const {id, err} = await fetchJson<{
      id?: string
      err?: string
    }>("/api/poll", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        question,
        answers: Array.from(new Set(answers.flatMap(({value}) => value || [])))
      })
    })

    if (err) {
      modal({type: "alert", message: (
        <Dialog.Title className="text-2xl text-center">
          {err}
        </Dialog.Title>
      )})
      throw err
    }

    if (id) {
      router.push(`/poll/${id}`)
    } else {
      throw "An error occurred"
    }
  }

  
  return (
    <main className="max-w-lg mx-auto mt-6 mb-12">
      <h1 className="flex items-center justify-center gap-2 text-4xl font-medium italic mb-2">
        <PlusIcon className="w-12 text-slate-700"/>New Poll
      </h1>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4	p-2">
          <QuestionField required autoFocus/>
          <AnswersField/>
          <SubmitForm>
            <span className="flex gap-2 justify-center">
              <PlusIcon className="w-5"/>Create Poll
            </span>
          </SubmitForm>
        </form>
      </FormProvider>
    </main>
  )
}



export default function NewPollPage() {
  return (
    <AuthRequired>
      <NewPoll/>
    </AuthRequired>
  )
}