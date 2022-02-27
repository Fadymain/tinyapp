const {users, urlDatabase} = require("./database");
const required = require("./express_server");



const emailVerifier = function (email) {
  for (const key in users) {
    
    if (users[key].email === email) {
      return true;
    }
  } 
  return false;
}

const getUserWithEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  
  return undefined
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

function generateRandomString() {
  const minVal = 35 ** 5;
  const randVal = Math.floor(Math.random() * minVal) + minVal;
  return randVal.toString(35);
};

module.exports = { emailVerifier, getUserWithEmail, urlsForUser, generateRandomString}