# Deploy-Track

Deploy-Track is a web-based dashboard for monitoring CI/CD pipeline activity, deployment history, release notes, and environment status for a minor project working model.

## Current Working Model

- Frontend dashboard for logging and viewing deployment events
- Backend API built with Express
- File-backed persistent storage using JSON as a lightweight database
- Summary cards for success, failed, running, and total deployments
- Deployment details including branch, environment, author, commit hash, duration, and logs

## Project Structure

```text
Deploy-Track/
├── Backend/
│   ├── data/
│   │   └── deployments.json
│   ├── package.json
│   └── server.js
├── Frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
└── .github/
    └── workflows/
        └── node.js.yml
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
