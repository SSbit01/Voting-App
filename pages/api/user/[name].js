import Session from "../../../lib/Session";
import User from "../../../models/user";

export default Session((req, res) => {
  const {body, method, session, query: {name}} = req;

  const user_cookie = session.get("user");

  if (user_cookie?.isLoggedIn && user_cookie?.name === name) {
    switch(method) {
      case "PATCH":
        User.findOne({name}, async(err, user) => {
          if (err) {
            res.status(500).json(err);
          } else if (!user) {
            res.status(404).json({err: "User not found"});
          } else {
            for (let i in body) {
              user[i] = body[i];
            }
            let json;
            if (user.name !== name) {
              json = {
                isLoggedIn: true,
                name: user.name
              }
              session.set("user", json);
              await session.save();
              let votes = session.get("votes");
              if (!votes) {
                votes = {}
              }
              json.votes = votes;
            } else {
              json = {isLoggedIn: true}
            }
            user.save(err2 => {
              if (err2) {
                res.status(500).json(err2);
              } else {
                res.status(200).json(json);
              }
            });
          }
        });
        break;
      case "DELETE":
        User.findOne({name}, "polls._id", (err, user) => {
          if (err) {
            res.status(500).json(err);
          } else if (!user) {
            res.status(404).json({err: "User not found"});
          } else {
            user.remove(async(err2) => {
              if (err2) {
                res.status(500).json(err2);
              } else {
                session.set("user", {});
                let votes = session.get("votes");
                if (!votes) {
                  votes = {}
                } else {
                  for (let id of user.polls.map(poll => poll._id)) {
                    delete votes[id];
                  }
                  session.set("votes", votes);
                }
                await session.save();
                res.status(200).json({
                  isLoggedIn: false,
                  votes
                });
              }
            });
          }
        });
    }
  } else {
    res.status(401).json({err: "Unauthorized. Request canceled"});
  }
});