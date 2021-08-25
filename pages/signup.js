import UserForm from "../components/UserForm";


export default function SignUp() {
  return (
    <div className="flex flex-col items-center gap-3">
      <UserForm action="/api/signup" button="Sign Up" alert_message="Invalid User -> Because it's already taken or it contains special characters" name_err="name" err={{
        type: "user",
        message: "Choose another username"
      }}/>
      <p className="text-center">
        Of course you can delete your account or any of your polls whenever you want.<br/>
        Username is case sensitive
      </p>
    </div>
  );
}