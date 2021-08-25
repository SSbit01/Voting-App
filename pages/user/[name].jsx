// Client
import {useRouter} from "next/router";
import useUser from "../../lib/useUser";
import Figure from "../../components/Figure";
import Poll from "../../components/Poll";


export default function Profile({name, img, polls}) {
  const router = useRouter();
  const {user} = useUser();

  if (router.isFallback) {
    return <h1>LOADING...</h1>
  }

  const IamTheUser = user?.name === name;
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex items-center gap-8">
        <Figure name={name} img={img}/>
        {IamTheUser &&
          <button className="button2" onClick={() => router.push("/settings")}>⚙️ SETTINGS</button>
        }
      </div>
      {(polls?.length > 0 || IamTheUser) &&
        <div className="flex flex-col items-center">
          <h1 className="mb-2">Poll(s)</h1>
          {IamTheUser && 
            <button onClick={() => router.push("/poll")}>New Poll</button>
          }
          <div className="polls">
            {polls.map((poll, i) => (
              <Poll key={i} figure={{name}} {...poll}/>
            ))}
          </div>
        </div>
      }
    </div>
  );
}



// Server
import User from "../../models/user";


export async function getServerSideProps({params: {name}}) {
  let props = await User.findOne({name}, "-_id -password");

  if (!props || props?.message) {
    return {
      notFound: true
    }
  } else {
    props = props.toObject();
    props.polls = props.polls.map(poll => {
      poll._id = poll._id.toString();
      poll.created = poll.created.toString();
      return poll;
    });
  }

  return {props}
}
