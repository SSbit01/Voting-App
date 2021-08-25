import Session from "../../../lib/Session";

export default Session(async({session}, res) => {
  let user = session.get("user");
  let votes = session.get("votes");
  if (!user) {
    session.set("user", {isLoggedIn: false});
    await session.save();
  }
  if (!votes) {
    votes = {}
  }
  res.json({
    ...user,
    votes
  });
});