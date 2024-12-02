import "dotenv/config";
import * as articlesModel from "../models/articles_model.mjs";
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
  const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{2}$/;
  return regex.test(date);
}

// Add routes for handling articles

// Create a new article
router.post("/articles", async (req, res) => {
  try {
    const article = await articlesModel.createArticle(req.body);
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Retrieve all articles
router.get("/articles", async (req, res) => {
  try {
    const articles = await articlesModel.findArticles(req.query);
    res.status(200).json(articles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Retrieve an article by ID
router.get("/articles/:id", async (req, res) => {
  try {
    const article = await articlesModel.findArticleById(req.params.id);
    if (article) {
      res.status(200).json(article);
    } else {
      res.status(404).json({ error: "Article not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update an article
router.put("/articles/:id", async (req, res) => {
  try {
    const update = await articlesModel.updateArticles(
      { _id: req.params.id },
      req.body
    );
    if (update.nModified > 0) {
      res.status(200).json({ message: "Article updated successfully" });
    } else {
      res.status(404).json({ error: "Article not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an article
router.delete("/articles/:id", async (req, res) => {
  try {
    const del = await articlesModel.deleteById({ _id: req.params.id });
    if (del.deletedCount > 0) {
      res.status(200).json({ message: "Article deleted successfully" });
    } else {
      res.status(404).json({ error: "Article not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
