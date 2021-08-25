import {useState, useEffect} from "react";
import Poll from "../components/Poll";


export default function Home() {
  const [data, setData] = useState();

  useEffect(() => {
    fetch("/api/polls/home").then(res => res.json()).then(d => {
      setData(d);
    });
  }, []);

  if (data) {
    return data.code ? (
      <div className="text-center">
        <h1>An error occurred</h1>
        <h2>{data.name}</h2>
      </div>
    ) : (
      <div>
        <h1 className="text-center mb-2">Voting App</h1>
        <div className="polls">
          {data.map((poll, i) => (
            <Poll key={i} {...poll}/>
          ))}
        </div>
      </div>
    );
  }

  return <h1>LOADING...</h1>
}
