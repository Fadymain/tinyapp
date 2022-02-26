const express = require("express");
const app = express();
const PORT = 8080; 
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const oneDay = 1000 * 60 * 60 * 24;

const {users, urlDatabase} = require("./database");


app.use(cookieSession({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",     
  saveUninitialized:true,     
  cookie: { maxAge: oneDay },     
  resave: false 
}));

app.use(cookieParser());
const bcrypt = require("bcryptjs");

const {emailVerifier, getUserWithEmail, urlsForUser} = require("./helpers");


const bodyParser = require("body-parser");
const req = require("express/lib/request");
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/register", (req, res) => {
  const newId = generateRandomString();
  const newEmail = req.body.email;
  const newPw = req.body.password;
  const hashedPassword = bcrypt.hashSync(newPw, 10);
  
  if (newEmail === "" || newPw === "") {
    return res.status(403).send("No password or Email entered");
  }
  else if(emailVerifier(newEmail)) {
    return res.status(403).send("Email already exists");
  } else {
    users[newId] = {
      id: newId, 
      email: newEmail, 
      password: hashedPassword
    };
    req.session.user_id = newId;
    return res.redirect("/urls");   
  }
});

app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    "user_id": req.session.user_id, 
    users: users
  };
  res.render("registration", templateVars)
});

app.post("/login", (req, res) => {
  const dEmail = req.body.email;
  const pasW = req.body.password;

  if (dEmail === "" || pasW === "") {
    return res.send("Email or password is empty");
  }
  const user = getUserWithEmail(dEmail, users)
  if (user)  {
    const hashedPassword = user.password;
    if (!bcrypt.compareSync(pasW, hashedPassword)) {
      return res.status(403).send("Email or password is wrong")
    } else {
      req.session.user_id = user.id;
      res.redirect("/urls");
    }
  } else {
    return res.status(403).send("User does not exist");
  }
});

app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user_id: req.session.user_id, 
    users: users
  };
  res.render("login_form", templateVars)
});


app.get("/urls", (req, res) => {
  let userId = req.session.user_id;
  console.log("userId:", userId);
  if(!userId) {
    return res.send("You need to have an account or register");
  }
  const userUrls = urlsForUser(userId);
  const templateVars = { 
    urls: userUrls, 
    "user_id": req.session.user_id, 
    users: users
  };
  console.log("templateVars:", templateVars);
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userId: req.session.user_id
  }
  res.redirect(`/urls/${shortURL}`);         
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let userId = req.session.user_id;
  const userUrls = urlsForUser(userId);
  const shortURL = req.params.shortURL;
  if (!userUrls[shortURL]) {
    return res.send("You dont have permission to delete");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let userId = req.session.user_id;
  const userUrls = urlsForUser(userId);
  const shortURL = req.params.shortURL;
  if (!userUrls[shortURL]) {
    return res.send("You dont have permission to edit");
  }
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userId: req.session.user_id
  }
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const newUrl = req.body.newUrl;
  urlDatabase[shortURL].longURL = newUrl;
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  let userId = req.session.user_id;
  if(!userId) {
    return res.redirect("/login");
  }
  const templateVars = {
    "user_id": req.session.user_id, 
    users: users
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let userId = req.session.user_id;
  let user = users[userId];
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
    "user_id": req.session.user_id, 
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
};