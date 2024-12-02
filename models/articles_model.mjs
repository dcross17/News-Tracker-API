import mongoose from "mongoose";
import cors from "cors";
import express from "express";
import "dotenv/config";

const ARTICLE_DB_NAME = "article_db";
const ARTICLE_COLLECTION = "articles";
const ARTICLE_CLASS = "Articles";
const ArticlesModel = createModel();
const app = express();
app.use(cors());

function createModel() {
  const articleSchema = mongoose.Schema({
    source: {
      id: { type: String, default: null },
      name: { type: String, default: null },
    },
    author: { type: String, default: null },
    title: { type: String, required: true },
    description: { type: String, default: null },
    url: { type: String, required: true, unique: true },
    urlToImage: { type: String, default: null },
    publishedAt: { type: Date, required: true },
    content: { type: String, default: null },
  });

  return mongoose.model(ARTICLE_CLASS, articleSchema, ARTICLE_COLLECTION);
}

/**
 * Create a new article
 * @param {Object} articleData
 * @returns Created article
 */
async function createArticle(articleData) {
  const article = new ArticlesModel(articleData);
  return await article.save();
}

/**
 * Retrieve all articles
 * @returns List of articles
 */
const findArticles = async (filter) => {
  const query = ArticlesModel.find(filter);
  return query.exec();
};

/**
 * Retrieve an article based on the ID
 * @param {String} article_id
 * @returns Article
 */
const findArticleById = (article_id) => {
  return ArticlesModel.findById(article_id).exec();
};

/**
 * Update an article with the provided filter and updates
 * @param {Object} filter
 * @param {Object} updates
 * @returns Updated article
 */
async function updateArticles(filter, updates) {
  const update = await ArticlesModel.updateOne(filter, updates);
  return update;
}

/**
 * Delete the article with provided id value
 * @param {Object} filter
 * @returns Count of deleted documents
 */
async function deleteById(filter) {
  const del = await ArticlesModel.deleteOne(filter);
  return del;
}

export {
  createArticle,
  findArticles,
  findArticleById,
  updateArticles,
  deleteById,
};
