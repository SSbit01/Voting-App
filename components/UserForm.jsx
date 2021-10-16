import {useState, useEffect} from "react";
import {useForm} from "react-hook-form";
import useUser from "../lib/useUser";


export default function UserForm({action, button, alert_message, name_err, err}) {
  const maxLength = 25;

  const {register, handleSubmit, setError, formState: {errors, isDirty, isValid, isSubmitting}, setFocus} = useForm({mode: "onChange"});

  const {mutateUser} = useUser({redirectTo: "/", redirectIfFound: true});

  async function onSubmit(data) {
    try {
      const r = await fetch(action, {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
      });
      const res = await r.json();
      mutateUser(res);
      if (!res.isLoggedIn) {
        alert(alert_message);
        if (name_err && err) {
          setError(name_err, err, {
            shouldFocus: true
          });
        }
      }
    } catch(err) {
      alert(err);
    }
  }

  useEffect(() => setFocus("name"), []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" maxLength={maxLength} placeholder={errors.name ? errors.name.message: "Username"} {...register("name", {pattern: /^\w+$/, required: "You must enter an username", maxLength})}/>
      <input type="password" size={maxLength} maxLength={maxLength} placeholder={errors.password ? errors.password.message : "Password"} {...register("password", {required: "You must enter a password", maxLength})}/>
      <button disabled={!isDirty || !isValid || isSubmitting}>{button}</button>
    </form>
  )
}