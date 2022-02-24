const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
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

app.post("/register", (req, res) => {
  const newId = generateRandomString();
  const newEmail = req.body.email;
  const newPw = req.body.password;
  
  if (newEmail === "" || newPw === "") {
    return res.status(403).send("No password or Email entered");
  }
  else if(emailVerifier(newEmail)) {
    return res.status(403).send("Email already exists");
  } else {
    users[newId] = {id: newId, email: newEmail, password: newPw};
    res.cookie("user_id", newId);
    return res.redirect("/login");   
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
  if (dEmail === "" || pasW === "") {
    return res.send("Email or password is empty");
  }
  const verifyEmail = emailVerifier(dEmail);
  if (!verifyEmail) {
    return res.status(403).send("Email or password is wrong")
  } 
  const passChecker = authUser(users, dEmail, pasW);
  if (!passChecker) {
    return res.redirect("/login");
  }
  const id = passChecker.id;
  
  // console.log("Test:", req)
  // console.log(res.cookies["user_id"]);
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, "user_id": req.cookies["user_id"], users: users};
  res.render("login_form", templateVars)
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, "user_id": req.cookies["user_id"], users: users};
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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
  urlDatabase[shortURL] = longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);         
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
})

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const newUrl = req.body.newUrl;
  urlDatabase[shortURL] = newUrl;
  res.redirect("/urls");
})

app.get("/urls/new", (req, res) => {
  const templateVars = {"user_id": req.cookies["user_id"], users: users}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], "user_id": req.cookies["user_id"], users: users};
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
