# TaskFlow-Pro (Cloud-Native Microservices + DevOps CI/CD Project)
Project: TaskFlow Pro AI-inspired Team Project Management Platform  (Inspired by Jira + Trello + Notion)

<img width="1600" height="1465" alt="TashFlow-Pro-Infrastructure-diagram" src="https://github.com/user-attachments/assets/50bb6c89-283c-4439-89c4-117a7ee6aab5" />

## 📌 Project Overview

**TaskFlow-Pro** is a cloud-ready **3-tier task and project management application** built using a **microservices architecture** and automated using modern **DevOps practices**.

The project demonstrates how a real-world application can be developed, containerized, continuously integrated, continuously delivered, and deployed on **AWS** using **GitHub, Jenkins, Docker, Terraform, and AWS services**.

The application allows users to manage projects and tasks through a web-based frontend, while independent backend microservices handle users, projects, tasks, and notifications.

---

##  Architecture

```text
                         ┌─────────────────────┐
                         │      Developer      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       GitHub        │
                         │   Source Control    │
                         └──────────┬──────────┘
                                    │
                              Webhook / Poll
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      Jenkins        │
                         │     CI/CD Server    │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    │                                │
                    ▼                                ▼
             ┌──────────────┐               ┌──────────────┐
             │ Docker Build │               │   Terraform  │
             │ Docker Images│               │ Infrastructure│
             └──────┬───────┘               └──────┬───────┘
                    │                              │
                    ▼                              ▼
             ┌──────────────┐                ┌──────────────┐
             │  AWS ECR     │                │     AWS      │
             │ Image Store  │                │ Infrastructure│
             └──────┬───────┘                └──────┬───────┘
                    │                              │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │  Application Load   │
                         │      Balancer       │
                         └──────────┬──────────┘
                                    │
                   ┌────────────────┴────────────────┐
                   │                                 │
                   ▼                                 ▼
          ┌─────────────────┐                ┌─────────────────┐
          │ React Frontend  │                │ Spring Boot API │
          │     / UI        │                │    Services     │
          └─────────────────┘                └────────┬────────┘
                                                      │
                     ┌────────────────────────────────┼─────────────────────────┐
                     │                                │                         │
                     ▼                                ▼                         ▼
             ┌──────────────┐                 ┌──────────────┐         ┌──────────────┐
             │ User Service │                 │Project Service│         │ Task Service │
             └──────┬───────┘                 └──────┬───────┘         └──────┬───────┘
                    │                                │                         │
                    └────────────────┬───────────────┴─────────────────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  Amazon RDS  │
                              │   Database   │
                              └──────────────┘

                         ┌─────────────────────┐
                         │ Notification Service│
                         └──────────┬──────────┘
                                    │
                                    ▼
                              ┌──────────────┐
                              │  Amazon SNS  │
                              └──────────────┘

                              ┌──────────────┐
                              │  Amazon S3   │
                              │ File Storage │
                              └──────────────┘

                              ┌──────────────┐
                              │  CloudWatch  │
                              │ Logs/Monitor │
                              └──────────────┘
```

---

# Application Flow

The overall application flow is:

```text
User
  │
  ▼
React Frontend
  │
  ▼
Application Load Balancer
  │
  ▼
Spring Boot Microservices
  │
  ├── User Service
  │
  ├── Project Service
  │
  ├── Task Service
  │
  └── Notification Service
          │
          ├── Amazon SNS
          │
          └── Amazon S3
          
Microservices
      │
      ▼
Amazon RDS
```

### Example: Creating a Task

```text
User
 │
 ▼
React UI
 │
 ▼
ALB
 │
 ▼
Task Service
 │
 ├── Validate request
 │
 ├── Process business logic
 │
 ▼
Amazon RDS
 │
 ▼
Task Created
 │
 ▼
Notification Service
 │
 ▼
Amazon SNS
 │
 ▼
Notification
```

---

# 🚀 DevOps CI/CD Flow

The DevOps pipeline follows this process:

```text
Developer
    │
    │ git push
    ▼
GitHub Repository
    │
    │ Webhook
    ▼
Jenkins
    │
    ├── 1. Checkout Code
    │
    ├── 2. Build Application
    │
    ├── 3. Run Tests
    │
    ├── 4. Docker Build
    │
    ├── 5. Docker Image Tag
    │
    ├── 6. Push Image to AWS ECR
    │
    ├── 7. Terraform Init
    │
    ├── 8. Terraform Plan
    │
    ├── 9. Terraform Apply
    │
    └── 10. Deploy Application
                    │
                    ▼
              AWS Environment
```

### CI — Continuous Integration

Jenkins automatically:

1. Pulls the latest code from GitHub.
2. Builds the application.
3. Runs automated tests.
4. Packages the application.
5. Builds Docker images.
6. Tags Docker images.
7. Pushes images to Amazon ECR.

### CD — Continuous Delivery/Deployment

After successful CI:

1. Jenkins executes Terraform.
2. Terraform provisions/updates AWS infrastructure.
3. Docker images are deployed.
4. Application becomes available through the load balancer.
5. Logs and application health can be monitored using CloudWatch.

---

# 🐳 Docker Architecture

Each major application component is containerized.

```text
                 Docker Environment
                       │
        ┌──────────────┼───────────────┐
        │              │               │
        ▼              ▼               ▼
   Frontend       User Service    Project Service
        │              │               │
        ▼              ▼               ▼
      Image          Image           Image
                       │
              ┌────────┴────────┐
              ▼                 ▼
        Task Service     Notification Service
              │                 │
              ▼                 ▼
            Image             Image
```

### Why Docker?

Docker provides:

- Consistent environments
- Application isolation
- Easy deployment
- Portable containers
- Faster deployments
- Simplified dependency management
- Easy scaling

---
# 🔧 Jenkins

**Jenkins** is used as the CI/CD automation server.

### Jenkins Pipeline

```text
GitHub
   │
   ▼
Jenkins
   │
   ├── Checkout
   │
   ├── Build
   │
   ├── Test
   │
   ├── Docker Build
   │
   │
   └── Deploy
```

The pipeline is defined using a **Jenkinsfile** stored in the GitHub repository.

Example stages:

```text
Checkout
   ↓
Build
   ↓
Test
   ↓
Docker Build
   ↓
Docker compose
   ↓
Deployment
```

---

# 🔀 Git & GitHub

Git is used for source-code version control and GitHub is used as the remote repository.

Typical workflow:

```bash
git clone
git checkout
git add
git commit
git push
```

Development workflow:

```text
Developer
    │
    ▼
Local Repository
    │
    │ git push
    ▼
GitHub
    │
    ▼
Jenkins
    │
    ▼
CI/CD Pipeline
```
# 📁 Project Structure

A possible repository structure:

```text
TaskFlow-Pro/
│
├── frontend/
│   └── React Application
│
|
|--- Backend
|        ├── user-service/
|       │   ├── src/
|       │   ├── pom.xml
|       │   └── Dockerfile
|       │
|       ├── project-service/
|       │   ├── src/
|       │   ├── pom.xml
|       │   └── Dockerfile
|       │
|       ├── task-service/
|       │   ├── src/
|       │   ├── pom.xml
|       │   └── Dockerfile
|       │
|       ├── notification-service/
|       │   ├── src/
|       │   ├── pom.xml
|       │   └── Dockerfile
│
│
├── Jenkinsfile
├── docker-compose.yml
└── README.md
```

---

# 🔌 Port Configuration

> **Important:** Use the exact ports from your current `application.yml`, Docker Compose, and frontend configuration. Based on the TaskFlow-Pro setup we've been working with, the service layout is typically documented like this:

| Component | Port | Purpose |
|---|---:|---|
| React Frontend | `3000` | Frontend application |
| User Service | `8081` | User APIs |
| Project Service | `8082` | Project APIs |
| Task Service | `8083` | Task APIs |
| Notification Service | `8084` | Notification APIs |
| Spring Boot | `808x` | Backend HTTP APIs |
| MySQL/RDS | `3306` | Database |
| Jenkins | `8080` | Jenkins web interface |
| Docker | `2375/2376` | Docker daemon — only when explicitly configured |
| HTTP | `80` | Web traffic |
| HTTPS | `443` | Secure web traffic |

**Don't blindly commit this table if your actual `application.yml` files use different ports.** The README should match your implementation exactly.

---

# 🧩 Technology Stack

## Frontend

- React
- HTML
- CSS
- JavaScript

## Backend

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- REST APIs
- Maven

## Database

- MySQL / Amazon RDS

## DevOps

- Git
- GitHub
- Jenkins
- Docker
- Docker Compose
- Terraform

## Cloud

- AWS EC2
- AWS VPC
- AWS ALB
- Amazon ECR
- Amazon RDS
- Amazon S3
- Amazon SNS
- Amazon CloudWatch
- AWS IAM

---



# 🎯 Key DevOps Concepts Demonstrated

This project demonstrates practical knowledge of:

- ✅ Version Control
- ✅ Git branching and GitHub
- ✅ CI/CD
- ✅ Jenkins pipelines
- ✅ Jenkinsfile
- ✅ Docker
- ✅ Docker Compose

---

# 🧪 Local Development

Clone the repository:

```bash
git clone <your-github-repository-url>
cd TaskFlow-Pro
```

Build the backend services:

```bash
mvn clean package
```

Build Docker images:

```bash
docker compose build
```

Start the application:

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

Stop the application:

```bash
docker compose down
```

---

# 🚀 Deployment Process

### Step 1 — Developer

Developer modifies the application.

### Step 2 — Git

Changes are committed:

```bash
git add .
git commit -m "Update Task Service"
git push
```

### Step 3 — GitHub

GitHub stores the latest source code.

### Step 4 — Jenkins

Jenkins automatically starts the pipeline.

### Step 5 — Build & Test

Jenkins builds the Spring Boot services and executes tests.

### Step 6 — Docker

Jenkins creates Docker images.


---

# 💡 Why This Project?

The purpose of TaskFlow-Pro is not only to build a task-management application but to demonstrate how a software application can move from:

```text
Development
     ↓
Source Control
     ↓
Continuous Integration
     ↓
Containerization
     ↓
Infrastructure as Code
     ↓
Cloud Deployment
     ↓
Monitoring
```

This represents a practical **DevOps lifecycle** used in modern software engineering environments.

---

# 👨‍💻 Author

**Shreyas N**

B.E. — Electronics & Communication Engineering

Interested in:

- DevOps
- Cloud Computing
- AWS
- CI/CD
- Docker
- Kubernetes
- Terraform
- Infrastructure Automation

---

## ⭐ Future Improvements

Planned improvements include:

- Kubernetes deployment using Amazon EKS
- Helm charts
- Prometheus + Grafana monitoring
- HTTPS using ACM
- Route 53 domain configuration
- AWS Auto Scaling
- Centralized logging
- SonarQube code-quality analysis
- Trivy container vulnerability scanning
- Blue/Green deployment
- Production-grade secrets management
- Multi-environment Terraform configuration
- Dev / QA / Production environments

---
