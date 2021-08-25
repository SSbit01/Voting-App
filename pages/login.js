import UserForm from "../components/UserForm";

export default function LogIn() {
  return (
    <UserForm action="/api/login" button="Log In" alert_message="Incorrect user or password"/>
  );
}