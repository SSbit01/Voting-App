import {useEffect} from "react";
import useUser from "../lib/useUser";


export default function LogOut() {
  const {mutateUser} = useUser({redirectTo: "/"});

  useEffect(() => {
    fetch("api/logout")
      .then(r => r.json())
      .then(res => {
        mutateUser(res, false);
      });
  }, []);

  return <h1>LOGGING OUT...</h1>
}