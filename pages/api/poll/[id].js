import Session from "../../../lib/Session";
import User from "../../../models/user";


export default Session((req, res) => {
  const {body, method, session, query: {id}} = req;

  if (["PATCH", "DELETE"].includes(method)) {
    const user_cookie = session.get("user");
    User.findOne({"polls._id": id}, async(err, user) => {
      if (err) {
        res.status(500).json(err);
      } else if (!user) {
        res.status(404).json({err: "User not found"});
      } else {
        const poll = user.polls.id(id);
        const auth = user_cookie?.isLoggedIn && user?.name === user_cookie?.name;
        switch(method) {
          case "PATCH":
            if (body?.new_options && !poll.closed && user_cookie?.isLoggedIn) {
              for (let i of body.new_options) {
                if (!poll.new_options?.hasOwnProperty(i)) {
                  poll.new_options[i] = 0;
                }
              }
            } else if (body?.changeVote && !poll.closed) {
              const option = body?.option;
              let votes = session.get("votes");
              if (!votes) {
                votes = {}
              } else if (votes?.[id]) {            
                if (votes[id] === option) {
                  return res.status(403).json({err: "The voted option is the same as the option set in the cookie"});
                }
                if (poll.original_options?.hasOwnProperty(votes[id])) {
                  poll.original_options[votes[id]]--;
                } else if (poll.new_options?.hasOwnProperty(votes[id])) {
                  poll.new_options[votes[id]]--;
                } else {
                  return res.status(403).json({err: "The option set in the cookie isn't in the options array"});
                }
                delete votes[id];
              }
              if (option) {
                if (poll.original_options?.hasOwnProperty(option)) {
                  poll.original_options[option]++;
                } else if (poll.new_options?.hasOwnProperty(option)) {
                  poll.new_options[option]++;
                } else {
                  return res.status(403).json({err: "The new option isn't in the options array"});
                }
                votes[id] = option;
              }
              session.set("votes", votes);
              await session.save();
            } else if (auth && body.hasOwnProperty("closed")) {
              poll.closed = body.closed;
            } else {
              return res.status(400).json({err: "Bad request"});
            }
            user.markModified("polls");
            user.save(err2 => {
              if (err2) {
                res.status(500).json(err2);
              } else {
                res.status(200).json({ok: true});
              }
            });
            break;
          case "DELETE":
            if (auth) {
              poll.remove();
              user.save(async(err2) => {
                if (err2) {
                  res.status(500).json(err2);
                } else {
                  const votes = session.get("votes");
                  if (votes?.[id]) {
                    delete votes[id];
                    session.set("votes", votes);
                    await session.save();
                  }
                  res.status(200).json({ok: true});
                }
              });
            } else {
              res.status(401).json({err: "Unauthorized. Request canceled"});
            }
        }
      }
    });
  }
});