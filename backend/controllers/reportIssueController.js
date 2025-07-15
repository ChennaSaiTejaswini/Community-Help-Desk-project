const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');


dotenv.config(); // ✅ Make sure this is loaded first

// ✅ AWS Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Initialize AWS services
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();
const cloudwatchlogs = new AWS.CloudWatchLogs();

module.exports = async (req, res) => {
  console.log("Received body:", req.body);

  try {
    const { title, description, location, email } = req.body;
    const imageFile = req.file;

    if (!title || !description || !location || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const issueId = uuidv4();
    let imageUrl = "";

    // ✅ Upload image to S3 if provided
    if (imageFile) {
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `issues/${issueId}_${imageFile.originalname}`,
        Body: imageFile.buffer,
        ContentType: imageFile.mimetype,
        
      };

      const uploadResult = await s3.upload(s3Params).promise();
      imageUrl = uploadResult.Location;
    }

    

    // ✅ Save to DynamoDB
    const item = {
      issueId,
      title,
      description,
      location,
      email,
      imageUrl,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    await dynamodb.put({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: item,
    }).promise();
    // 🔽 CloudWatch Logging (Optional but you mentioned it earlier)
const logGroupName = '/community-helpdesk/issues';
const logStreamName = 'user-submissions';

try {
  const describeResp = await cloudwatchlogs.describeLogStreams({
    logGroupName,
    logStreamNamePrefix: logStreamName,
  }).promise();

  const sequenceToken = describeResp.logStreams[0]?.uploadSequenceToken;

  await cloudwatchlogs.putLogEvents({
    logGroupName,
    logStreamName,
    logEvents: [
      {
        message: `📝 New Issue Submitted:\n${JSON.stringify(item)}`,
        timestamp: Date.now(),
      },
    ],
    ...(sequenceToken && { sequenceToken }),
  }).promise();

  console.log("✅ Log sent to CloudWatch");
} catch (logErr) {
  console.error("❌ CloudWatch log error:", logErr.message);
}


    // ✅ Send email (optional)
    const emailParams = {
  Source: process.env.SES_EMAIL_FROM,
  Destination: {
    ToAddresses: [process.env.SES_EMAIL_TO], // Admin receives
  },
  Message: {
    Subject: { Data: `📩 New Issue Reported: ${title}` },
    Body: {
      Text: {
        Data: `A new issue was reported.\n\nTitle: ${title}\nDescription: ${description}\nLocation: ${location}\nUser Email: ${email}\nImage: ${imageUrl || "No image"}`,
      },
    },
  },
};

    

    await ses.sendEmail(emailParams).promise();

    res.status(200).json({ message: "Issue reported successfully!", issueId });

  } catch (err) {
    console.error("Error reporting issue:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
