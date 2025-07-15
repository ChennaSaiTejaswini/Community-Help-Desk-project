const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();
//const cloudwatchlogs = new AWS.CloudWatchLogs();

const dynamodb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();

module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Update the issue status
    await dynamodb.update({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: { issueId: id },
      UpdateExpression: 'set #s = :status',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':status': 'Resolved' }
    }).promise();

    // 2. Send email (optional, can be disabled if not needed)
    const emailParams = {
      Source: process.env.SES_EMAIL_FROM,
      Destination: { ToAddresses: [process.env.SES_EMAIL_TO] }, // or use stored user email if available
      Message: {
        Subject: { Data: `Issue ${id} Resolved` },
        Body: {
          Text: {
            Data: `Your reported issue (ID: ${id}) has been marked as resolved. Thank you!`
          }
        }
      }
    };

    await ses.sendEmail(emailParams).promise();

    res.status(200).json({ message: 'Issue marked as resolved!' });
  } catch (err) {
    console.error("Error resolving issue:", err);
    res.status(500).json({ error: 'Could not update issue status' });
  }
};
