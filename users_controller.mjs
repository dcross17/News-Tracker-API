import "dotenv/config";
import cors from "cors";
import * as usersModel from "./users_model.mjs";
import express from "express";
import jwt from "jsonwebtoken";

const PORT = process.env.PORT;
const app = express();
const corsOrigin = {
  origin: "http://localhost:5173", //or whatever port your frontend is using
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOrigin));

app.use(express.json());

main().catch((err) => console.log(err));
async function main() {
  await usersModel.connect();

  console.log("Connected to MongoDB");
}

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

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

function validateRequest(req) {
  /*const { name, reps, weight, unit, date } = req.body;
  if (
    typeof name !== "string" ||
    typeof reps !== "number" ||
    typeof weight !== "number" ||
    typeof unit !== "string" ||
    typeof date !== "string"
  ) {
    return false;
  }
  if (
    name === null ||
    name === "" ||
    reps < 1 ||
    weight < 1 ||
    (unit !== "lbs" && unit !== "kgs")
  ) {
    return false;
  }
  if (!isDateValid(date)) {
    return false;
  }*/
  return true;
}

/**
 * Create a new user with the title, year and language provided in the body
 */
app.post("/users", async (req, res) => {
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
app.get("/users", async (req, res) => {
  const users = await usersModel.findUsers(req.query);
  res.status(200).json(users);
});

/**
 * Retrieve the user corresponding to the ID provided in the URL.
 */
app.get("/users/:user_id", async (req, res) => {
  const user = await usersModel.findUsers({
    _id: req.params.user_id,
  });
  if (user.length > 0) {
    res.status(200).json(user[0]);
  } else {
    res.status(404).json({ Error: "Not found" });
  }
});

/* 
  Find user by login credentials */
app.get("/user/:identifier/:password", async (req, res) => {
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
      const token = jwt.sign({ user: user[0].id }, "SECRET_KEY");
      res
        .status(200)
        .json({ message: "Login successful", user: user[0].id, token: token });
    } else {
      res.status(404).json({ Error: "User not found" });
    }
  }
});

/**
 * Update the user whose id is provided in the path parameter and set
 * its title, year and language to the values provided in the body.
 */
app.put("/users/:user_id", async (req, res) => {
  if (!validateRequest(req)) {
    res.status(400).json({ Error: "Invalid request" });
  } else {
    var update = await usersModel.updateUser(
      { _id: req.params.user_id },
      req.body
    );
    if (update.matchedCount > 0) {
      var user = await usersModel.findUsers({
        _id: req.params.user_id,
      });
      res.status(200).json(user[0]);
    } else {
      res.status(404).json({ Error: "Not found" });
    }
  }
});

/**
 * Delete the user whose id is provided in the query parameters
 */
app.delete("/users/:user_id", async (req, res) => {
  var deletedUser = await usersModel.deleteById({
    _id: req.params.user_id,
  });
  if (deletedUser.deletedCount === 1) {
    res.status(204).send();
  } else {
    res.status(404).json({ Error: "Not found" });
  }
});
