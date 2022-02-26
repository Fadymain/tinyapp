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
      return users[user];
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

module.exports = { emailVerifier, getUserWithEmail, urlsForUser}