# CityPulse: Urban Issue Reporting & Analytics Platform

CityPulse is a full-stack web application designed to empower citizens to report civic issues, track their resolution, and visualize urban data through an interactive dashboard. It provides a platform for real-time issue reporting, community engagement through upvoting, and data-driven analytics for city management.

## Key Features

- Interactive Map Reporting: Users can click on a map to pinpoint the exact location of an issue, ensuring accuracy.
- Real-Time Updates: The dashboard and report lists update instantly without needing a page refresh.
- User Authentication: Secure JWT-based authentication allows users to register, log in, and manage their own reports.
- Report Management: Users can create, edit, and mark their reports as "solved."
- Community Upvoting: A secure upvote system allows users to support important issues, preventing users from upvoting their own reports or a single report multiple times.
- Data Analytics: An analytics dashboard displays charts for report statuses and categories, providing insights into urban issues.
- Dark Mode: A sleek, modern UI with a toggle for light and dark modes.

## Tech Stack

### Frontend

- Framework: React
- Styling: Tailwind CSS
- Mapping: Leaflet & React-Leaflet
- Charts: Chart.js & react-chartjs-2
- HTTP Client: Axios
- Routing: React Router
- Authentication: JWT Decode

### Backend

- Framework: Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT (jsonwebtoken) & bcrypt.js
- Middleware: CORS, Express-Validator

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js and npm installed
- MongoDB installed and running, or a MongoDB Atlas account

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Lehari1/citypulse.git
   cd citypulse
