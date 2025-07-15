// backend/routes/issueRoutes.js

const express = require("express");
const AWS = require("aws-sdk");
const router = express.Router();
require("dotenv").config();

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE_NAME;

// 🟢 Get all issues
router.get("/issues", async (req, res) => {
  try {
    const data = await dynamodb.scan({ TableName: tableName }).promise();
    res.json(data.Items);
  } catch (err) {
    console.error("Error fetching issues:", err);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});

// 🟢 Mark issue as resolved
router.put("/issues/:id/resolve", async (req, res) => {
  try {
    const params = {
      TableName: tableName,
      Key: { issueId: req.params.id },
      UpdateExpression: "set #st = :s",
      ExpressionAttributeNames: { "#st": "status" },
      ExpressionAttributeValues: { ":s": "Resolved" },
    };
    await dynamodb.update(params).promise();
    res.json({ message: "Issue marked as resolved" });
  } catch (err) {
    console.error("Error updating issue status:", err);
    res.status(500).json({ error: "Failed to update issue status" });
  }
});

module.exports = router;
