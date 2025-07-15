const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config();

const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports = async (req, res) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
  };

  try {
    const data = await dynamodb.scan(params).promise();
    res.status(200).json(data.Items);
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
};
