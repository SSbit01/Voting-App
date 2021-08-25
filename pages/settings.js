import {useState} from "react";
import useUser from "../lib/useUser";
import ChangeProp from "../components/ChangeProp";


export default function Settings() {
  const {user, mutateUser} = useUser({redirectTo: "/"});

  const [disable, setDisable] = useState(false);

  function deleteAccount() {
    if (confirm("Are you sure to delete your account?")) {
      setDisable(true);
      fetch(`/api/user/${user.name}`, {
        method: "DELETE"
      }).then(r => r.json()).then(res => {
        if (res?.isLoggedIn === false) {
          alert("Account successfully deleted");
          mutateUser(res, false);
        } else {
          setDisable(false);
          alert(JSON.stringify(res));
        }
      });
    }
  }

  return (
    <div className="text-center flex flex-col items-center gap-8">
      <h1>⚙️ Settings</h1>
      <div className="flex flex-wrap gap-4 justify-center">
        {[["Username","name","text"], ["Password","password","password"], ["Image URL","img","url"]].map((arr, i) => (
          <ChangeProp key={i} title={arr[0]} prop={arr[1]} type={arr[2]} disable={disable} setDisable={setDisable}/>
        ))}
      </div>
      <button className="bg-transparent	text-red-500 font-semibold border border-red-500 hover:bg-red-500 hover:text-white focus:ring-red-300" onClick={deleteAccount} disabled={disable}>🗑️ DELETE ACCOUNT</button>
    </div>
  );
}
