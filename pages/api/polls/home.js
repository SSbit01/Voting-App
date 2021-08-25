import User from "../../../models/user";

export default function getHome(req, res) {
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
                    $eq: ["$$poll.closed", false]
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
  ], (err, data) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.status(200).send(data.length ? data[0].polls.sort((a, b) => b.created-a.created) : []);
    }
  });
}