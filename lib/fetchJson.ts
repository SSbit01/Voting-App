export default function fetchJson<T = any>(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, init).then((res): Promise<T> => res.json())
}