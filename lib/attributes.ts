export const nameField = {
  maxLength: 20,
  pattern: /^\w+$/
}

export const passwordField = {
  maxLength: 50
}

export const questionField = {
  maxLength: 200,
  pattern: /^\S(.*\S)?$/,
  patternMessage: "No leading or trailing spaces"
}

export const answerField = {
  maxLength: 100,
  pattern: /^\S(.*\S)?$/,
  patternMessage: "No leading or trailing spaces"
}