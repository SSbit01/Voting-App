import Session from "../../lib/Session";
import User from "../../models/user";


export default Session((req, res) => {
  const {method, body, session} = req;

  if (method === "POST") {
    const {name, password} = body;
    User.findOne({name}, "-_id -name -img -polls", async(err, user) => {
      let votes = session.get("votes");
      if (!votes) {
        votes = {}
      }
      const failed = {
        votes
      }
      if (user?.comparePassword(password)) {
        const json = {
          isLoggedIn: true,
          name
        }
        session.set("user", json);
        await session.save();
        res.status(200).json({...json, votes});
      } else if (!user) {
        res.status(404).json(failed);
      } else {
        res.status(500).json(failed);
      }
    });
  }
});
