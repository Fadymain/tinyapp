const bcrypt = require("bcryptjs");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "userRandomID22"
  }
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  }
}

module.exports = {urlDatabase, users};