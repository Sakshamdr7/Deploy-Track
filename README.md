# Deploy-Track

Deploy-Track is a full-stack **Deployment Tracking Dashboard** for monitoring deployment activity across multiple projects.

It is built for local demo and academic presentation use, with a product-style UI and API-backed deployment records.

## What This Project Is

- GitHub tracks code changes
- Deploy-Track tracks deployment activity

Core workflow:
1. Create deployment events from dashboard form or CI simulator buttons
2. Store records in backend JSON storage
3. Analyze records through dashboard, filters, projects view, and system status
4. Review latest and failed deployments quickly during demos

## Final Feature Set

- Multi-view dashboard: Dashboard, Deployments, Add Deployment, Projects, System Status, About
- Responsive drawer navigation + overlay behavior
- Dark mode with local persistence
- Deployment filters: project, status, environment, search, sort
- Deployment detail view (`View Details`) with full metadata + logs
- CI simulator triggers for one-click staging/production pipeline runs
- Pipeline metadata tracking (`pipelineRunId`, `workflowName`, `jobName`, run link)
- System status improvements:
  - latest deployment summary
  - failure monitor (count + rate + latest failure)
  - recent failure triage list
- Demo authentication:
  - login + signup UI
  - local demo user/session storage
  - dashboard access restricted until login
  - logout support
- Backend service layering + tests

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Storage: JSON file (`Backend/data/deployments.json`)
- Testing: Node assert tests for service logic
- CI Flow: Built-in simulator via UI buttons for demo-friendly automation

## Project Structure

```text
Deploy-Track/
|-- Backend/
|   |-- data/
|   |   |-- deployments.json
|   |   `-- deployments.sample.json
|   |-- src/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- storage/
|   `-- server.js
|-- Frontend/
|   |-- index.html
|   |-- script.js
|   `-- style.css
|-- docs/
|   `-- DEMO_FLOW.md
`-- README.md
```

## Run Locally

```bash
cd Backend
npm install
npm start
```

Then open:
- [http://localhost:1945](http://localhost:1945)

## Demo Login

- Email: `demo@deploytrack.com`
- Password: `demo1234`

You can also create a new demo account from the Signup tab.

## Data Files and Repo Hygiene

- `Backend/data/deployments.json` is intentionally tracked as an empty array (`[]`)
- `Backend/data/deployments.sample.json` contains realistic sample records for demo seeding
- On first run, backend auto-creates `deployments.json` if missing

To seed sample data for a demo session, copy sample file contents into `deployments.json`.

## API Endpoints

- `GET /api/health`
- `GET /api/deployments`
- `GET /api/deployments/:id`
- `GET /api/stats`
- `GET /api/projects`
- `POST /api/deployments`

### Query Parameters (`GET /api/deployments`)

- `project=<project-name>`
- `status=success|failed|running`
- `environment=development|staging|production`
- `branch=<branch-name>`
- `source=dashboard|ci-simulator|github-actions`
- Search also supports pipeline metadata fields (`pipelineRunId`, `workflowName`, `jobName`)
- `search=<text>`
- `sort=latest|oldest`

## Testing

```bash
cd Backend
npm test
```

## Presentation Notes

Use [docs/DEMO_FLOW.md](docs/DEMO_FLOW.md) for a step-by-step demo script and talking points.
Use [docs/SCREENSHOT_CHECKLIST.md](docs/SCREENSHOT_CHECKLIST.md) to capture final presentation screenshots.

## Pipeline Stages

Deploy-Track models a practical CI/CD lifecycle:
1. Build
2. Test
3. Deploy
4. Verify

The CI simulator buttons in **Add Deployment** generate deployment records that represent this automated flow.
