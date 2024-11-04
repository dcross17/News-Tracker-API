import mongoose, { mongo } from "mongoose";
import cors from "cors";
import express from "express";
import "dotenv/config";

const USER_DB_NAME = "user_db";
const USER_COLLECTION = "users";
const USER_CLASS = "Users";
const UsersModel = createModel();
const app = express();
app.use(cors());

async function connect() {
  await mongoose.connect(process.env.MONGODB_CONNECT_STRING, {
    dbName: USER_DB_NAME,
  });
  // TODO : Comment this out before deploying
  //await mongoose.connection.db.dropCollection(USER_COLLECTION);
  return mongoose.connection;
}

function createModel() {
  const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    preferences: { type: Array, default: [], required: false },
    saved: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
  });
  // model class from schema
  return mongoose.model(USER_CLASS, userSchema);
}

async function createUser(
  name,
  email,
  password,
  preferences,
  saved,
  favorites
) {
  console.log("Creating user");
  console.log(name, email, password, preferences, saved, favorites);
  const user = new UsersModel({
    name: name,
    email: email,
    password: password,
    preferences: preferences,
    saved: saved,
    favorites: favorites,
  });
  console.log(user);
  return user.save();
}

/**
 * Retrieve all users
 * @returns
 */
const findUsers = async (filter) => {
  const query = UsersModel.find(filter);
  return query.exec();
};

/**
 * Retrieve users based on the ID
 * @param {Object} user_id
 * @returns
 */
const findUsersById = (user_id) => {
  const result = users.filter((user) => user_id === user._id);
  return result.length === 0 ? null : result[0];
};

async function findUserByCredentials(identifier, password) {
  let nameOrEmail = identifier.includes("@")
    ? { email: identifier }
    : { name: identifier };
  const query = UsersModel.find({ ...nameOrEmail, password: password });
  console.log(query);
  return query.exec();
}
/**
 * Update the user based on the ID
 * @param {Object} filter
 * @param {Object} updates
 * @returns Number of documents modified
 */

async function updateUsers(filter, updates) {
  const update = UsersModel.updateOne(filter, updates);
  return update;
}

/**
 * Delete the user with provided id value
 * @param {Object} filter
 * @returns Count of deleted documents
 */
async function deleteById(filter) {
  const del = UsersModel.deleteOne(filter);
  return del;
}

export {
  createUser,
  findUsers,
  findUsersById,
  findUserByCredentials,
  updateUsers,
  deleteById,
  connect,
};
