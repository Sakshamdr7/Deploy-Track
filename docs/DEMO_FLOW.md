# Deploy-Track Demo Flow

Use this flow for a 5-8 minute project presentation.

## 1) Start and Login (30-45 sec)

- Open `http://localhost:1945`
- Show login gate
- Login with:
  - `demo@deploytrack.com`
  - `demo1234`

Talking point:
"This is a deployment tracking dashboard, not a code hosting platform. It focuses on deployment events and release health."

## 2) Dashboard Overview (1 min)

- Show total/success/failed/running counters
- Highlight latest deployment and recent activity stream

Talking point:
"The dashboard gives immediate release health visibility."

## 3) Deployment History + Filters + Detail View (2 min)

- Open **Deployments**
- Apply filters (status/environment/project/search)
- Click **View Details** on one row
- Show full metadata: project, branch, author, source, logs

Talking point:
"This view supports quick debugging context by combining filtering with record-level detail."

## 4) Add Deployment (1 min)

- Open **Add Deployment**
- Create one deployment entry (try failed or running for visible effect)
- Submit and show it appear in Deployments/System Status

Talking point:
"This simulates CI or manual release events and immediately updates dashboard data."

## 5) Projects + System Status (1.5 min)

- Open **Projects** to show multi-project grouping
- Open **System Status**
  - service health
  - failure monitor
  - latest deployment notes
  - recent failed deployments panel

Talking point:
"System Status is designed for quick operational awareness, especially around failure triage."

## 6) UX Polish and Product Feel (45 sec)

- Toggle dark mode
- Open/close navigation drawer
- Mention responsive UI + clean architecture

## 7) Close (30 sec)

Mention final engineering choices:
- focused scope
- working core features first
- demo auth (intentionally lightweight)
- JSON persistence with clean sample-data setup for repository safety
