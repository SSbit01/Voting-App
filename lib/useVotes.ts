import useSWR from "swr"
import type { VotesCookie } from "@/lib/withSession"


export default function useVotes() {
  const {data, mutate, error} = useSWR<VotesCookie>("/api/vote")

  return {
    myVotes: data || {},
    mutateVotes: mutate,
    isLoading: !error && !data,
    isError: error
  }
}