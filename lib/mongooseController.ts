import { Model, Schema, model, connect, connection } from "mongoose"
import { hashSync, compareSync } from "bcrypt"

import { nameField, passwordField, questionField, answerField } from "@/lib/attributes"

import type { Types, PopulatedDoc, Document } from "mongoose"



interface Timestamps {
  createdAt: Date
  updateAt: Date
}

export interface IUser extends Timestamps {
  name: string
  password: string
}

export interface IUserMethods {
  comparePassword(data: string | Buffer): boolean
}

export type UserModel = Model<IUser, {}, IUserMethods>


type PopulateUser = PopulatedDoc<Document<Types.ObjectId> & IUser>

export interface IAnswer extends Timestamps {
  value: string
  votes: number
  author?: PopulateUser
}

export interface IPoll extends Timestamps {
  closed?: Date
  author: PopulateUser
  question: string
  answers: Types.DocumentArray<IAnswer>
  createdAt: Date
  updateAt: Date
}



const MODEL_NAME = {
  USER: "User",
  POLL: "Poll"
}



if (connection.readyState === 0) {
  if (!process.env.MONGODB_URI) {
    throw "MONGODB_URI environment variable is not defined!"
  }
  
  connect(process.env.MONGODB_URI)
  
  const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    name: {
      type: String,
      required: true,
      unique: true,
      maxLength: nameField.maxLength,
      validate: nameField.pattern
    },
    password: {
      type: String,
      required: true
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })

  userSchema.method("comparePassword", function(data: string | Buffer) {
    return compareSync(data, this.password)
  })
  
  userSchema.pre("save", function(next) {
    if (this.isModified("password")) {
      if (this.password.length <= passwordField.maxLength) {
        this.password = hashSync(this.password, 8)
      } else {
        next(new Error(`Password length is over ${passwordField.maxLength}`))
      }
    }
    next()
  })
  
  model<IUser, UserModel>(MODEL_NAME.USER, userSchema)
  
  model<IPoll>(MODEL_NAME.POLL, new Schema<IPoll>({
    closed: Date,
    author: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.USER,
      required: true
    },
    question: {
      type: String,
      maxLength: questionField.maxLength,
      validate: [questionField.pattern, questionField.patternMessage],
      required: true
    },
    answers: {
      type: [new Schema<IAnswer>({
        value: {
          type: String,
          maxLength: answerField.maxLength,
          validate: [answerField.pattern, answerField.patternMessage],
          required: true
        },
        votes: {
          type: Number,
          min: 0,
          default: 0
        },
        author: {
          type: Schema.Types.ObjectId,
          ref: MODEL_NAME.USER
        }
      }, {
        _id: false,
        timestamps: true
      })],
      required: true
    }
  }, {
    versionKey: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }))
}



export const User = model<IUser, UserModel>(MODEL_NAME.USER)

export const Poll = model<IPoll>(MODEL_NAME.POLL)