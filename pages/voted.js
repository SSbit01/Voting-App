import {useState, useEffect} from "react";
import Poll from "../components/Poll";


export default function Voted() {
  const [data, setData] = useState();

  useEffect(() => {
    fetch("/api/polls/voted").then(res => res.json()).then(d => {
      setData(d);
    });
  }, []);

  if (data) {
    console.log(data);
    return (
      <div>
        <h1 className="text-center mb-2">Polls Voted</h1>
        <div className="polls">
          {data.length ? 
            data.map((poll, i) => (
              <Poll key={i} {...poll}/>
            )) : <h2>You haven&apos;t voted in any poll</h2>
          }
        </div>
      </div>
    );
  }

  return <h1>LOADING...</h1>
}