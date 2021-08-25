import {useRouter} from "next/router";
import Link from "next/link";
import useUser from "../lib/useUser";


export default function NavBar() {
  const {user} = useUser();
  const router = useRouter();

  return (
    <div className="min-w-full bg-gray-900 bg-opacity-90 text-white text-center flex flex-col gap-1.5 sm:flex-row justify-between p-4 shadow-md">
      <p><i>Welcome{user?.isLoggedIn?`, ${user.name}`:""}</i></p>
      <nav className="flex flex-wrap justify-center">
        {[["","Home"],["voted", "Voted"],...(user?.isLoggedIn ? [["poll","New Poll"],[`user/${user.name}`,"Profile"],["settings","Settings"],["logout","Log Out"]] : [["login","Log In"],["signup","Sign Up"]])].map((arr, i) => (
          <Link href={`/${arr[0]}`} key={i}>
            <a className={`px-3 ${router.pathname === `/${arr[0]}` ? "text-purple-400" : "text-blue-200 hover:text-red-400"}`}>{arr[1]}</a>
          </Link>
        ))}
      </nav>
    </div>
  );
}