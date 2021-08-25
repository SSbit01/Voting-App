import {useEffect} from "react";
import useUser from "../lib/useUser";


export default function LogOut() {
  const {mutateUser} = useUser({redirectTo: "/"});

  useEffect(() => {
    fetch("api/logout")
      .then(r => r.json())
      .then(res => {
        alert("Success: You've been logged out");
        mutateUser(res);
      });
  }, []);

  return <h1>LOGGING OUT...</h1>
}