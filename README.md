#### PROJECT STRUCTURE ####
DevOps-E2E/
│
├── backend/                 # Backend application
├── frontend/                # Frontend application
├── helm/
│   └── task-app/            # Helm chart
│       ├── templates/
│       ├── values.yaml
│       └── Chart.yaml
├── docker-compose.yaml
├── README.md
└── .github/
    └── workflows/
        └── ci.yaml         # CI/CD pipeline

#### Project Overview ####

This project implements a production-style DevOps workflow where:

1. Developer pushes code to GitHub
2. GitHub Actions pipeline triggers
3. Docker images are built
4. Images are pushed to DockerHub
5. Helm `values.yaml` gets updated automatically
6. Updated Helm values are committed back to GitHub
7. ArgoCD detects Git changes
8. Kubernetes cluster gets updated automatically


#### Deployment Flow ####
Code Change
   ↓
Git Push
   ↓
CI Pipeline
   ↓
Build Docker Images
   ↓
Push Docker Images to Hub
   ↓
Helm values update
   ↓
Git Push
   ↓
ArgoCD Sync
   ↓
Kubernetes Update
