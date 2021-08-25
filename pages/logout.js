import {useEffect} from "react";
import {useRouter} from "next/router";
import useUser from "../lib/useUser";


export default function LogOut() {
  const router = useRouter();
  const {mutateUser} = useUser();

  useEffect(() => {
    fetch("api/logout")
      .then(r => r.json())
      .then(res => {
        mutateUser(res);
        router.push("/");
      });
  }, []);

  return <h1>LOGGING OUT...</h1>
}