const express = require('express');
const router = express.Router();
const multer = require("multer");
const reportIssue = require('../controllers/reportIssueController');
const resolveIssue = require('../controllers/resolveIssueController');
const upload = multer({ storage: multer.memoryStorage() });

router.post("/report-issue", upload.single("image"), reportIssue);
router.put('/resolve-issue/:id', resolveIssue);
module.exports = router;
