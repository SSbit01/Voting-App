import {useForm} from "react-hook-form";
import useUser from "../lib/useUser";


export default function ChangeProp({title="", prop="a", type="text", disable=false, setDisable=()=>false}) {
  const {register, handleSubmit, formState: {isDirty, isValid}, setValue} = useForm({mode: "onChange"});

  const {user, mutateUser} = useUser();

  const maxLength = prop === "img" ? 1000 : 25;

  const isName = prop === "name";

  function onSubmit(data) {
    if (confirm(`Are you sure to change your ${title}?`)) {
      setDisable(true);
      const body = JSON.stringify(data);
      fetch(`/api/user/${user.name}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body
      }).then(r => r.json()).then(res => {
        setDisable(false);
        if (res?.isLoggedIn) {
          alert(`${title} successfully updated`);
          setValue(prop, "", {shouldValidate: true});
          if (isName) {
            mutateUser(res);
          }
        } else {
          alert(JSON.stringify(res));
        }
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>{title}</h2>
      <input type={type} maxLength={maxLength} placeholder={`New ${title}`} {...register(prop, {pattern: isName && /^\w+$/, required: true, maxLength,
        validate: isName && (v => v !== user.name)
      })} disabled={disable}/>
      <button disabled={!isDirty || !isValid || disable}>Change {title}</button>
    </form>
  );
}