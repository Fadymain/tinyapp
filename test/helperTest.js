const { assert } = require('chai');

const { getUserWithEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserWithEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserWithEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined for a non-existent email', function() {
    const user = getUserWithEmail("a@a", testUsers);
    assert.equal(user, undefined);
  })
});