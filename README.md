#  Community Help Desk

A full-stack cloud-native application designed to connect community members with local help services. This system allows users to raise support tickets, track their status, and get assistance efficiently using scalable AWS infrastructure.

---

##  Key Features

-  **Raise and Track Support Tickets**
  - Users can submit issues or requests for help (e.g., water, health, civic issues)
  - Unique ticket ID generation and real-time status tracking

-  **Email Notifications**
  - Automatic updates sent via AWS SES when a ticket is raised or resolved

- 🗂 **Secure File Uploads**
  - Documents and images stored in AWS S3

-  **Centralized Ticket Database**
  - Efficient data handling with AWS DynamoDB

-  **IAM Role-Based Access**
  - Fine-grained access control to backend services

-  **Cloud Monitoring**
  - Activity and logs tracked using AWS CloudWatch Logs

---

##  Tech Stack

| Layer      | Tech/Service             |
|------------|--------------------------|
| Frontend   | React.js / HTML / CSS    |
| Backend    | Node.js / Express.js     |
| Cloud DB   | AWS DynamoDB             |
| Storage    | AWS S3                   |
| Auth       | AWS IAM                  |
| Logs       | AWS CloudWatch Logs      |
| Email      | AWS SES                  |
| Deployment | GitHub (can be deployed on EC2/Lambda) |

---



