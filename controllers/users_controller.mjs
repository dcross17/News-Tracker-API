import "dotenv/config";
import * as usersModel from "../models/users_model.mjs";
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

/**
 *
 * @param {string} date
 * Return true if the date format is MM-DD-YY where MM, DD and YY are 2 digit integers
 */
function isDateValid(date) {
  // Test using a regular expression.
  // To learn about regular expressions see Chapter 6 of the text book
  const format = /^\d\d-\d\d-\d\d$/;
  return format.test(date);
}

/**
 * Filter out sensitive information from the user object.
 * @param {Object} user - The user object.
 * @returns {Object} - The user object without sensitive information.
 */
function filterSensitiveInfo(user) {
  console.log("User", user);
  const filteredUser = {
    _id: user._id,
    name: user.name,
    preferences: user.preferences,
    saved: user.saved,
    favorites: user.favorites,
  };
  return filteredUser;
}

/**
 * Create a new user with the title, year and language provided in the body
 */
router.post("/", async (req, res) => {
  // check if user already exists
  const userExists = await usersModel.findUsers({ email: req.body.email });
  if (userExists.length > 0) {
    console.log(userExists);
    res.status(409).json({ Error: "User already exists" });
  } else {
    console.log(req.body);
    const { name, email, password, preferences, saved, favorites } = req.body;
    const user = await usersModel.createUser(
      name,
      email,
      password,
      preferences,
      saved,
      favorites
    );
    res.status(201).json({ message: "User created", user: user });
  }
});

/**
 * Retrieve all users.
 */
router.get("/", async (req, res) => {
  const users = await usersModel.findUsers(req.query);
  res.status(200).json(users);
});

/**
 * Retrieve the user corresponding to the ID provided in the URL.
 */
router.get("/:user_id", async (req, res) => {
  const user = await usersModel.findUsers({
    _id: req.params.user_id,
  });
  console.log(user);
  if (user.length > 0) {
    res.status(200).json(user[0]);
  } else {
    res.status(404).json({ Error: "Not found" });
  }
});

/* 
  Find user by login credentials */
router.get("/:identifier/:password", async (req, res) => {
  console.log(req.params);
  if (!req.params.identifier || !req.params.password) {
    res.status(400).json({ Error: "Invalid request" });
  } else {
    const user = await usersModel.findUserByCredentials(
      req.params.identifier,
      req.params.password
    );
    if (user.length > 0) {
      console.log(user);
      const filteredUser = filterSensitiveInfo(user[0]);
      console.log("Filtered", filteredUser);
      const token = jwt.sign({ user: filteredUser }, "SECRET_KEY");
      res.status(200).json({
        message: "Login successful",
        user: filteredUser,
        token: token,
      });
    } else {
      res.status(404).json({ Error: "User not found" });
    }
  }
});

/**
 * Update the user whose id is provided in the path parameter and set
 * its title, year and language to the values provided in the body.
 */
router.put("/:user_id", async (req, res) => {
  console.log(req.body);
  var update = await usersModel.updateUsers(
    { _id: req.params.user_id },
    req.body
  );
  console.log(update);
  if (update.matchedCount > 0) {
    var user = await usersModel.findUsers({
      _id: req.params.user_id,
    });
    console.log(user);
    const filteredUser = filterSensitiveInfo(user[0]);
    console.log("Filtered", filteredUser);
    res.status(200).json({
      message: "Update successful",
      user: filteredUser,
    });
  } else {
    res.status(404).json({ Error: "Not found" });
  }
});

/**
 * Delete the user whose id is provided in the query parameters
 */
router.delete("/:user_id", async (req, res) => {
  var deletedUser = await usersModel.deleteById({
    _id: req.params.user_id,
  });
  if (deletedUser.deletedCount === 1) {
    res.status(204).send();
  } else {
    res.status(404).json({ Error: "Not found" });
  }
});

export default router;
