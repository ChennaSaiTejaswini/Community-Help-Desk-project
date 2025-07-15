const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();

module.exports = async (req, res) => {
    console.log("🟡 Inside markResolved controller");
  const { id } = req.params;

  try {
    // 1. Get the issue to fetch user email
    const issueData = await dynamodb.get({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: { issueId: id },
    }).promise();

    console.log("Fetched issue data:", issueData.Item); // ✅ DEBUG

    const userEmail = issueData.Item?.email;

    if (!userEmail) {
      console.error("❌ No email found for this issue.");
      return res.status(400).json({ error: "No user email found for this issue" });
    }

    // 2. Update status
    await dynamodb.update({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: { issueId: id },
      UpdateExpression: "set #s = :s",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: { ":s": "Resolved" },
    }).promise();

    console.log("✅ Status updated. Sending email to:", userEmail);

    // 3. Send Email
    const emailParams = {
      Source: process.env.SES_EMAIL_FROM,
      Destination: {
        ToAddresses: [userEmail],
      },
      Message: {
        Subject: { Data: "✅ Your Issue Has Been Resolved" },
        Body: {
          Text: {
            Data: `Hi,\n\nYour issue with ID ${id} has been marked as resolved by the admin.\n\nThank you!`,
          },
        },
      },
    };

    const emailResult = await ses.sendEmail(emailParams).promise();
    console.log("📧 Email sent successfully:", emailResult);

    res.json({ message: "Issue resolved and email sent." });

  } catch (err) {
    console.error("❌ Error in markResolvedController:", err);
    res.status(500).json({ error: "Failed to mark issue as resolved" });
  }
};
