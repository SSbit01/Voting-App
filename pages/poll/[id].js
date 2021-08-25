// Client
import {useRouter} from "next/router";
import Poll from "../../components/Poll";


export default function PollPage(props) {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>LOADING...</h1>
  }
  return <Poll {...props}/>
}



// Server
import User from "../../models/user";
import Session from "../../lib/Session";


export const getServerSideProps = Session(async({params: {id}, req: {session}}) => {
  let props;
  try {
    props = await User.findOne({"polls._id": id}, "name img polls.$ -_id");
  } catch {
    props = undefined;
  }

  if (!props) {
    const votes = session.get("votes");
    if (votes?.[id]) {
      delete votes[id];
      session.set("votes", votes);
      await session.save();
    }
    return {
      notFound: true
    }
  } else {
    const {name, img, polls} = props;
    const poll = polls[0].toObject();
    poll._id = poll._id.toString();
    poll.created = poll.created.toString();
    props = {
      ...poll,
      figure: {
        name,
        img
      }
    }
  }

  return {props}
});