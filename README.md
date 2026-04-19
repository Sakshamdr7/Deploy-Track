# Deploy-Track

## Project Overview

Deploy-Track is a full-stack web dashboard for monitoring CI/CD pipeline activity, deployment history, release status, and environment updates through a simple local working model.

## Project Goal

Deploy-Track aims to provide a centralized dashboard for tracking deployment events, viewing pipeline outcomes, storing release-related metadata, and improving visibility into software delivery workflows in a simple full-stack web application.

## Key Features

- Dashboard for logging and viewing deployment events
- Backend API built with Express
- Persistent local storage using JSON as a lightweight database
- Summary cards for total, successful, failed, and running deployments
- Deployment metadata including branch, environment, author, commit hash, duration, and logs
- GitHub Actions workflow for project validation

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Storage: JSON-based local persistence
- CI/CD: GitHub Actions

## How It Works

1. The user opens the dashboard locally in the browser.
2. The frontend sends deployment data to the backend API.
3. The backend validates and stores the deployment record.
4. The dashboard fetches updated deployment history and statistics.
5. The latest deployment state is shown in the UI with status and logs.

## Project Structure

```text
Deploy-Track/
|-- Backend/
|   |-- data/
|   |   `-- deployments.json
|   |-- package.json
|   `-- server.js
|-- Frontend/
|   |-- index.html
|   |-- script.js
|   `-- style.css
|-- .github/
|   `-- workflows/
|       `-- node.js.yml
`-- docs/
    `-- FINAL_SCOPE.md
```

## Run Locally

1. Open a terminal in `Backend`
2. Install dependencies
3. Start the server
4. Open `http://localhost:5000`

```bash
cd Backend
npm install
npm start
```

## API Endpoints

- `GET /api/health`
- `GET /api/deployments`
- `GET /api/stats`
- `POST /api/deployments`

## Sample Deployment Payload

```json
{
  "status": "success",
  "message": "Production deployment completed successfully",
  "environment": "production",
  "branch": "main",
  "commitHash": "a1b2c3d",
  "author": "Saksham",
  "duration": 124,
  "logs": "Build passed. Container updated. Smoke checks passed."
}
```

## Future Enhancements

- Add filtering and search for deployment history
- Add deployment detail modal or side panel
- Replace JSON persistence with MongoDB
- Improve CI/CD integration for automatic deployment event creation
- Add screenshots and architecture diagrams for project presentation
