import {Schema, models, model, connect} from "mongoose";
import {hashSync, compareSync} from "bcrypt";


const model_name = "user";


if (!models.hasOwnProperty(model_name)) {
  connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  });

  const child_schema = new Schema({
    q: {
      type: String,
      required: true,
      maxLength: 200
    },
    original_options: {
      type: Object,
      required: true,
      validate(obj) {
        const keys = Object.keys(obj);
        return keys.every(str => str.length <= 50) && keys.length >= 2;
      }
    },
    new_options: {
      type: Object,
      default: {},
      validate(obj) {
        const arr = Object.keys(obj);
        const arr2 = Object.keys(this.original_options);
        return arr.every(str => str.length <= 50 && !arr2.includes(str));
      }
    },
    closed: {
      type: Boolean,
      default: false
    },
    created: {
      type: Date, 
      default: Date.now
    }
  });

  const schema = new Schema({
    name: {
      type: String,
      required: true,
      unique: true,
      maxLength: 25,
      validate(str) {
        return /^\w+$/.test(str);
      }
    },
    password: {
      type: String,
      required: true
    },
    img: {
      type: String,
      default: "https://i.ibb.co/JrvVLxB/hen.jpg",
      validate(str) {
        return fetch(str, {method: "HEAD"}).then(res => res.ok && res.headers.has("Content-Type", "image/jpeg"));
      }
    },
    polls: [child_schema]
  }, {versionKey: false});

  schema.pre("save", function(next) {
    if (this.isModified("password")) {
      if (this.password.length <= 25) {
        this.password = hashSync(this.password, 8);
      } else {
        next(new Error("Password length is over 25."));
      }
    }
    next();
  });
  
  schema.methods.comparePassword = function(str) {
    return compareSync(str, this.password);
  }
  
  model(model_name, schema);
}


export default models[model_name];