# Deploy-Track Final Scope

This document locks the final scope for the end-term version of Deploy-Track so the project stays focused and realistically completable.

## Final Project Goal

Build a polished local full-stack dashboard for monitoring CI/CD activity, deployment history, release notes, environment status, and deployment logs.

## Final Demo Story

1. A user opens the dashboard locally
2. The dashboard shows deployment statistics and recent history
3. A new deployment event is created from the UI or CI flow
4. The backend stores the deployment record
5. The dashboard refreshes and displays the latest status, logs, and metadata

## Must-Have Features

- Dashboard homepage with summary cards
- Deployment history list
- Deployment creation form
- Backend API for health, deployments, and stats
- Persistent storage for deployment records
- Deployment fields:
  - status
  - environment
  - branch
  - commit hash
  - author
  - duration
  - message
  - logs
  - timestamp
- GitHub Actions workflow for project validation
- README with setup instructions

## Nice-to-Have Features

- Filter by status
- Filter by environment
- Search by branch or commit hash
- Deployment detail drawer or modal
- Seed data generator
- Improved activity timeline

## Out of Scope

- User authentication
- Multi-user roles
- Cloud production hosting
- Docker or Kubernetes
- Email notifications
- AI-based log analysis
- Admin panel

## 12-Day Build Strategy

### Day 1
- Lock scope
- Clean docs
- Seed realistic deployment data

### Day 2
- Refactor backend structure
- Prepare reusable data utilities

### Day 3
- Add filtering and query support in API

### Day 4
- Improve dashboard layout and navigation

### Day 5
- Add frontend filters and search

### Day 6
- Build deployment detail view

### Day 7
- Add richer stats and latest activity section

### Day 8
- Improve validation and error handling

### Day 9
- Refine GitHub Actions and CI story

### Day 10
- Responsive polish and UI cleanup

### Day 11
- README screenshots, architecture notes, and demo flow

### Day 12
- End-to-end testing and bug fixes
