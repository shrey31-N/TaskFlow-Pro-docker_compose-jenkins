# TaskFlow-Pro (Cloud-Native Microservices + DevOps CI/CD Project)
Project: TaskFlow Pro AI-inspired Team Project Management Platform  (Inspired by Jira + Trello + Notion)

<img width="1600" height="1465" alt="TashFlow-Pro-Infrastructure-diagram" src="https://github.com/user-attachments/assets/50bb6c89-283c-4439-89c4-117a7ee6aab5" />

📌 Short Description
TaskFlow-Pro is a cloud-ready task and project management application developed using a microservices architecture and deployed using modern DevOps and cloud technologies.
The application consists of independent Spring Boot microservices for managing users, projects, tasks, and notifications. The complete deployment workflow is automated using GitHub, Jenkins, Docker, Terraform, and AWS.
The project demonstrates a real-world DevOps lifecycle:
Development
     ↓
GitHub
     ↓
Jenkins CI/CD
     ↓
Docker
     ↓
Amazon ECR
     ↓
Terraform
     ↓
AWS Infrastructure
     ↓
Application Deployment
     ↓
CloudWatch Monitoring
🏗️ Architecture Diagram
                              ┌─────────────────┐
                              │    Developer    │
                              └────────┬────────┘
                                       │
                                    git push
                                       │
                                       ▼
                              ┌─────────────────┐
                              │     GitHub      │
                              │  Source Control │
                              └────────┬────────┘
                                       │
                                    Webhook
                                       │
                                       ▼
                              ┌─────────────────┐
                              │     Jenkins     │
                              │    CI / CD      │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
             ┌──────────────┐                     ┌──────────────┐
             │    Docker    │                     │  Terraform   │
             │    Build     │                     │     IaC      │
             └──────┬───────┘                     └──────┬───────┘
                    │                                    │
                    ▼                                    ▼
             ┌──────────────┐                     ┌──────────────┐
             │  Amazon ECR  │                     │     AWS      │
             │ Docker Images│                     │ Infrastructure│
             └──────┬───────┘                     └──────┬───────┘
                    │                                    │
                    └────────────────┬───────────────────┘
                                     │
                                     ▼
                           ┌───────────────────┐
                           │ Application Load  │
                           │     Balancer      │
                           └─────────┬─────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
             ┌─────────────┐                  ┌──────────────────┐
             │   React     │                  │  Spring Boot     │
             │  Frontend   │                  │  Microservices   │
             └─────────────┘                  └────────┬─────────┘
                                                       │
                         ┌─────────────────────────────┼────────────────────────┐
                         │                             │                        │
                         ▼                             ▼                        ▼
                  ┌──────────────┐             ┌──────────────┐         ┌──────────────┐
                  │ User Service │             │Project Service│         │ Task Service │
                  └──────┬───────┘             └──────┬───────┘         └──────┬───────┘
                         │                             │                        │
                         └─────────────────────────────┼────────────────────────┘
                                                       │
                                                       ▼
                                                ┌──────────────┐
                                                │  Amazon RDS  │
                                                │   Database   │
                                                └──────────────┘

                  ┌──────────────────────┐
                  │ Notification Service│
                  └──────────┬───────────┘
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
🔄 CI/CD Flow
The complete CI/CD pipeline is automated using Jenkins.
                    Developer
                        │
                        │ git push
                        ▼
                  ┌────────────┐
                  │   GitHub   │
                  └─────┬──────┘
                        │
                     Webhook
                        │
                        ▼
                  ┌────────────┐
                  │  Jenkins   │
                  └─────┬──────┘
                        │
                        ▼
                 Checkout Source
                        │
                        ▼
                  Build Project
                        │
                        ▼
                  Run Unit Tests
                        │
                        ▼
                 Docker Build
                        │
                        ▼
                Docker Image Tag
                        │
                        ▼
                  Push to ECR
                        │
                        ▼
                Terraform Init
                        │
                        ▼
                Terraform Plan
                        │
                        ▼
               Terraform Apply
                        │
                        ▼
               AWS Deployment
                        │
                        ▼
                Health Check
                        │
                        ▼
               CloudWatch Logs
CI — Continuous Integration
Jenkins performs:
- Source-code checkout
- Application build
- Dependency resolution
- Unit testing
- Docker image creation
- Docker image tagging
- Push to Amazon ECR
CD — Continuous Deployment
After successful CI:
- Terraform provisions/updates infrastructure
- Docker images are deployed
- Application is exposed through the Load Balancer
- Application logs are monitored through CloudWatch
🛠️ Technologies
Frontend
Technology	Purpose
React	User interface
HTML	Application structure
CSS	Styling
JavaScript	Frontend logic


Backend
Technology	Purpose
Java	Backend programming language
Spring Boot	Microservices framework
Spring Web	REST APIs
Spring Data JPA	Database interaction
Maven	Build and dependency management


DevOps
Tool	Purpose
Git	Version control
GitHub	Source-code repository
Jenkins	CI/CD automation
Docker	Containerization
Docker Compose	Local multi-container environment
Terraform	Infrastructure as Code


AWS
Service	Purpose
EC2	Compute
VPC	Networking
Subnets	Network segmentation
Security Groups	Network security
Application Load Balancer	Traffic distribution
Amazon ECR	Docker image registry
Amazon RDS	Relational database
Amazon S3	Object/file storage
Amazon SNS	Notifications
IAM	Access management
CloudWatch	Monitoring and logging
Route 53	DNS — optional
CloudFront	CDN — optional


📂 Project Structure
TaskFlow-Pro/
│
├── frontend/
│   └── React Application
│
├── user-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── project-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── task-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── notification-service/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
│
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── provider.tf
│   └── terraform.tfvars
│
├── Jenkinsfile
├── docker-compose.yml
└── README.md
🔌 Ports
Component	Port	Description
React Frontend	3000	Frontend
User Service	8081	User APIs
Project Service	8082	Project APIs
Task Service	8083	Task APIs
Notification Service	8084	Notification APIs
Jenkins	8080	Jenkins Dashboard
MySQL	3306	Database
HTTP	80	Web traffic
HTTPS	443	Secure web traffic


⚠️ Verify these against your actual application.yml and docker-compose.yml before publishing. Your README should always match the implementation.

⚙️ Setup
1. Clone Repository
git clone <YOUR-GITHUB-REPOSITORY-URL>

cd TaskFlow-Pro
2. Build Backend Services
For each Spring Boot service:
mvn clean package
3. Build Docker Containers
docker compose build
4. Start Application
docker compose up -d
5. Check Containers
docker ps
6. Stop Application
docker compose down
☁️ Deployment
The application can be deployed to AWS using the following workflow:
GitHub
   │
   ▼
Jenkins
   │
   ├──────────────► Docker Build
   │                     │
   │                     ▼
   │                  Amazon ECR
   │
   └──────────────► Terraform
                         │
                         ▼
                    AWS Resources
                         │
                         ▼
                 Application Load
                     Balancer
                         │
                         ▼
                  Application
                         │
                         ▼
                    CloudWatch
Deployment Steps
1. Push Code
git add .
git commit -m "Deploy TaskFlow-Pro"
git push origin main
2. Jenkins Pipeline
Jenkins automatically starts the pipeline after the GitHub change.
3. Docker Build
Jenkins builds Docker images for the application services.
4. Push Images
Images are pushed to Amazon ECR.
5. Terraform
Terraform creates or updates AWS infrastructure.
terraform init
terraform plan
terraform apply
6. Application Deployment
The application is deployed to the AWS environment and exposed through the Application Load Balancer.
7. Monitoring
CloudWatch is used to monitor application and infrastructure logs/metrics.
🔧 DevOps Concepts Demonstrated
This project demonstrates practical implementation of:
Version Control
- Git
- GitHub
- Git commits
- Branching
- Repository management
CI/CD
- Jenkins
- Jenkinsfile
- Automated builds
- Automated testing
- Automated deployment
Containerization
- Docker
- Dockerfile
- Docker images
- Docker containers
- Docker Compose
- Amazon ECR
Infrastructure as Code
- Terraform
- Terraform providers
- Variables
- Outputs
- Resource provisioning
- Infrastructure version control
AWS Cloud
- EC2
- VPC
- Subnets
- Security Groups
- ALB
- ECR
- RDS
- S3
- SNS
- IAM
- CloudWatch
Microservices
- Independent services
- REST APIs
- Service separation
- Independent deployment
- Containerized services
Monitoring
- CloudWatch Logs
- Infrastructure metrics
- Application monitoring
- Troubleshooting through logs
🔮 Future Improvements
The following features can be added to make TaskFlow-Pro more production-oriented:
- Kubernetes deployment using Amazon EKS
- Helm charts
- Prometheus monitoring
- Grafana dashboards
- SonarQube code-quality analysis
- Trivy container vulnerability scanning
- HTTPS using AWS Certificate Manager
- Route 53 domain configuration
- Auto Scaling
- Centralized logging
- AWS Secrets Manager
- Dev / QA / Production environments
- Blue-Green deployment
- Rolling deployment
- Terraform remote state using S3
- Terraform state locking
- Jenkins shared libraries
🎯 Project Goal
The primary goal of TaskFlow-Pro is to demonstrate how a modern application can be developed and operated using a complete DevOps workflow:
       ┌─────────────────────────────┐
       │        APPLICATION          │
       │     TaskFlow-Pro            │
       └──────────────┬──────────────┘
                      │
                      ▼
              ┌───────────────┐
              │     GitHub     │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │    Jenkins     │
              │     CI/CD      │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │     Docker     │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   Amazon ECR   │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   Terraform    │
              │      IaC       │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │      AWS       │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   Production   │
              │   Application  │
              └───────────────┘
👨‍💻 Author
Shreyas N
DevOps | AWS | Docker | Jenkins | Terraform | Java | Spring Boot
⭐ DevOps Project Summary
TaskFlow-Pro is a cloud-ready microservices application that demonstrates an end-to-end DevOps implementation using GitHub for source control, Jenkins for CI/CD automation, Docker for containerization, Amazon ECR for image management, Terraform for Infrastructure as Code, AWS for cloud deployment, and CloudWatch for monitoring.
