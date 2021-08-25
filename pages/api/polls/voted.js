import {Types} from "mongoose";
import Session from "../../../lib/Session";
import User from "../../../models/user";

export default Session(({session}, res) => {
  let votes = session.get("votes");
  if (!votes || typeof votes !== "object") {
    res.status(400).json({err: "You haven't voted in any poll"});
  } else {
    const ids = Object.keys(votes);
    const mapped_ids = Object.keys(votes).map(id => Types.ObjectId(id));
    User.aggregate([
      {
        $group: {
          _id: null,
          polls: {
            $push: {
              $map: {
                input: {
                  $filter: {
                    input: "$polls",
                    as: "poll",
                    cond: {
                      $in: ["$$poll._id", mapped_ids]
                    }
                  }
                },
                as: "poll",
                in: {
                  $mergeObjects: [
                    "$$poll",
                    {
                      figure: {
                        name: "$name",
                        img: "$img"
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          polls: {
            $reduce: {
              input: "$polls",
              initialValue: [],
              in: {
                $concatArrays: ["$$this", "$$value"]
              }
            }
          }
        }
      }
    ], async(err, data) => {
      if (err) {
        res.status(500).json(err);
      } else {
        let arr;
        if (data.length) {
          arr = data[0].polls;
          const returned_ids = arr.map(poll => poll._id.toString());
          const difference = ids.filter(id => !returned_ids.includes(id));
          if (difference.length) {
            for (let id of difference) {
              if (votes?.[id]) {
                delete votes[id];
              }
            }
            session.set("votes", votes);
            await session.save();
          }
        } else {
          arr = [];
        }
        res.status(200).send(arr);
      }
    });
  }
});