import {useRouter} from "next/router";
import {useState, useEffect} from "react";
import {useForm, useFieldArray, useWatch} from "react-hook-form";
import useUser from "../../lib/useUser";
import PlusMinus from "../../components/PlusMinus";


export default function NewPoll() {
  useUser({redirectTo: "/login"});

  const router = useRouter();

  const maxLengthQ = 200;
  const maxLengthO = 50;

  const MinOptionsLength = 2;
  const defaultValues = {
    options: new Array(MinOptionsLength).fill({value: ""})
  }

  const {control, register, handleSubmit, formState: {isDirty, isValid}, setFocus} = useForm({
    mode: "onChange",
    defaultValues
  });

  const {fields, append, remove} = useFieldArray({
    control,
    name: "options"
  });

  const watchOptions = useWatch({
    control, 
    name: "options"
  });

  const [disable, setDisable] = useState(false);

  useEffect(() => {
    setFocus("q");
  }, []);

  function onSubmit(data) {
    setDisable(true);
    const body = JSON.stringify({
      q: data.q,
      original_options: [...new Set(data.options.map(f => f.value))]
    });
    fetch("/api/poll", {
      method:"POST",
      headers: {"Content-Type": "application/json"},
      body
    }).then(r => r.json()).then(data => {
      if (!data?.id) {
        setDisable(false);
        alert(JSON.stringify(data));
      } else {
        router.push(`/poll/${data.id}`);
      }
    });
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-center">New Poll</h1>
      <textarea maxLength={maxLengthQ} placeholder="Question" {...register("q", {required: true, maxLength: maxLengthQ})}></textarea>
      <fieldset className="flex flex-col gap-1.5">
        <legend>Options</legend>
        {fields.map((data, i) => (
          <input key={data.id} defaultValue={data.value} type="text" maxLength={maxLengthO} placeholder="Option" {...register(`options.${i}.value`, {
            required: true, 
            maxLength: maxLengthO,
            validate() {
              return new Set(watchOptions.map(f => f.value)).size === fields.length;
            }
          })} disabled={disable}/>
        ))}
        <PlusMinus plus={() => append({value: ""})} minus={() => remove(fields.length-1)} disabled_minus={fields.length <= MinOptionsLength}/>
      </fieldset>
      <button type="submit" disabled={!isDirty || !isValid || disable}>New Poll</button>
    </form>
  );
}