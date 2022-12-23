import useSWR from "swr"
import type { UserCookie } from "@/lib/withSession"


export default function useUser() {
  const { data, mutate, error } = useSWR<UserCookie>("/api/user")

  return {
    user: data || {},
    mutateUser: mutate,
    isLoading: !error && !data,
    isError: error
  }
}