const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bcrypt = require("bcryptjs");


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

const emailVerifier = function (email) {
  for (const key in users) {
    
    if (users[key].email === email) {
      return true;
    }
  } 
  return false;
}

const authUser = function (users, email, password) {
  for (let user in users) {
    if (users[user].email === email && users[user].password === password) {
      return users[user];
    }
  }
  return false;
}

const getUserWithEmail = function(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null
}

const urlsForUser = function (id) {
  let userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
}

app.post("/register", (req, res) => {
  const newId = generateRandomString();
  const newEmail = req.body.email;
  const newPw = req.body.password;
  const hashedPassword = bcrypt.hashSync(newPw, 10);
  console.log("hashedPassword:", hashedPassword)
  
  if (newEmail === "" || newPw === "") {
    return res.status(403).send("No password or Email entered");
  }
  else if(emailVerifier(newEmail)) {
    return res.status(403).send("Email already exists");
  } else {
    users[newId] = {id: newId, email: newEmail, password: hashedPassword};
    console.log(users);
    res.cookie("user_id", newId);
    return res.redirect("/urls");   
  }
  //saves entry to database
  // console.log("users", users);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, "user_id": req.cookies["user_id"], users: users};
  res.render("registration", templateVars)
})

app.post("/login", (req, res) => {
  const dEmail = req.body.email;
  const pasW = req.body.password;
  // const hashedPassword = bcrypt.hashSync(pasW, 10);
  // bcrypt.compareSync(pasW, hashedPassword);
  // console.log("login hash compare", bcrypt.compareSync(pasW, hashedPassword))

  if (dEmail === "" || pasW === "") {
    return res.send("Email or password is empty");
  }
  const user = getUserWithEmail(dEmail)
  if (user)  {
    const hashedPassword = user.password;
    if (!bcrypt.compareSync(pasW, hashedPassword)) {
      return res.status(403).send("Email or password is wrong")
    } else {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    }
  } else {
    return res.status(403).send("User does not exist");
  }

  

  // const verifyEmail = emailVerifier(dEmail);
  // if (!verifyEmail) {
  //   return res.status(403).send("Email or password is wrong")
  // } 
  // const passChecker = authUser(users, dEmail, pasW);
  // if (!passChecker) {
  //   return res.redirect("/login");
  // }
  // const id = passChecker.id;
  
  // // console.log("Test:", req)
  // // console.log(res.cookies["user_id"]);
  // res.cookie("user_id", id);
  // res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, "user_id": req.cookies["user_id"], users: users};
  res.render("login_form", templateVars)
});


app.get("/urls", (req, res) => {
  let userId = req.cookies["user_id"];
  if(!userId) {
    return res.send("You need to have an account or register");
  }
  const userUrls = urlsForUser(userId);
  const templateVars = { urls: userUrls, "user_id": req.cookies["user_id"], users: users};
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // let userId = req.cookies["user_id"];
  // if(!userId) {
  //   return res.send("You need to have an account or register");
  // }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});


app.post("/urls", (req, res) => {
  // console.log(req.body.longURL);  
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  // urlDatabase[shortURL] = longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userId: req.cookies["user_id"]
  }
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);         
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let userId = req.cookies["user_id"];
  const userUrls = urlsForUser(userId);
  const shortURL = req.params.shortURL;
  if (!userUrls[shortURL]) {
    return res.send("You dont have permission to delete");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.post("/urls/:shortURL/edit", (req, res) => {
  let userId = req.cookies["user_id"];
  const userUrls = urlsForUser(userId);
  const shortURL = req.params.shortURL;
  if (!userUrls[shortURL]) {
    return res.send("You dont have permission to edit");
  }
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userId: req.cookies["user_id"]
  }
  res.redirect(`/urls/${shortURL}`);
})

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const newUrl = req.body.newUrl;
  urlDatabase[shortURL].longURL = newUrl;
  res.redirect("/urls");
})

app.get("/urls/new", (req, res) => {
  let userId = req.cookies["user_id"];
  if(!userId) {
    return res.redirect("/login");
  }
  const templateVars = {user_id: req.cookies["user_id"], users: users}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let userId = req.cookies["user_id"];
  let user = users[userId];
  console.log(userId, user)
  if (!userId || !user) {
    return res.send("You should be logged in");
  }
  const userUrls = urlsForUser(userId);
  const shortURL = req.params.shortURL;
  if (!userUrls[shortURL]) {
    return res.send("You do not have permission");
  }

  const templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL].longURL, 
    "user_id": req.cookies["user_id"], 
    users: users
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  const minVal = 35 ** 5;
  const randVal = Math.floor(Math.random() * minVal) + minVal;
  return randVal.toString(35);
}
