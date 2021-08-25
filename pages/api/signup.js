import Session from "../../lib/Session";
import User from "../../models/user";

export default Session((req, res) => {
  const {method, body, session} = req;

  if (method === "POST") {
    const {name, password} = body;
    new User({
      name,
      password
    }).save(async(err) => {
      if (err) {
        res.status(500).json({isLoggedIn: false});
      } else {
        const json = {
          isLoggedIn: true,
          name
        }
        session.set("user", json);
        await session.save();
        res.status(200).json(json);
      }
    });
  }
});
