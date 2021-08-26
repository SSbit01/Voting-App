import Session from "../../lib/Session";

export default Session(async({session}, res) => {
  const json = {isLoggedIn: false}
  session.set("user", json);
  await session.save();
  let votes = session.get("votes");
  if (!votes) {
    votes = {}
  }
  json.votes = votes;
  res.status(200).json(json);
});
