import Session from "../../../lib/Session";
import User from "../../../models/user";


export default Session((req,res) => {
  const {method, session, body} = req;

  if (method === "POST") {
    const {name, isLoggedIn} = session.get("user");
    if (isLoggedIn && name) {
      body.original_options = Object.fromEntries(body.original_options.map(v => ([v, 0]))); 
      User.findOneAndUpdate({name}, {$push: {polls: body}}, {
        new: true,
        fields: "polls._id -_id",
      }, (err, user) => {
        if (err) {
          res.status(500).json(err);
        } else if (!user) {
          res.status(404).json({err: "User not found"});
        } else {
          const id = user.polls.slice(-1)[0]._id;
          res.status(200).json({id});
        }
      });
    } else {
      res.status(401).json({err: "Unauthorized"});
    }
  }
});
