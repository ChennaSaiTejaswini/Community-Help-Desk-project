const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const AWS = require("aws-sdk");
const reportIssue = require("./controllers/reportIssueController");
const getIssues = require('./controllers/getIssuesController');

const issueRoutes = require('./routes/issueRoutes'); // ✅ NEW
const markResolved = require('./controllers/markResolvedController');
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

app.post("/report-issue", upload.single("image"), reportIssue);


app.put('/issues/:id/resolve', markResolved);
app.use('/', issueRoutes);




// 🔽 Use issue routes for admin
app.use('/admin', issueRoutes); // ✅ Prefix with /admin
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
