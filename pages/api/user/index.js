import Session from "../../../lib/Session";

export default Session(({session}, res) => {
  let user = session.get("user");
  let votes = session.get("votes");
  if (!user) {
    user = {isLoggedIn: false}
  }
  if (!votes) {
    votes = {}
  }
  res.json({
    ...user,
    votes
  });
});