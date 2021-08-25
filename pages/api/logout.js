import Session from "../../lib/Session";

export default Session(async({session}, res) => {
  session.set("user", {});
  let votes = session.get("votes");
  if (!votes) {
    votes = {}
  }
  await session.save();
  res.status(200).json({
    isLoggedIn: false,
    votes
  });
});
