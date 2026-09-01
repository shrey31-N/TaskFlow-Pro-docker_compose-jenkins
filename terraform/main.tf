# ============================================================
# VPC
# ============================================================

resource "aws_vpc" "taskflow_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "taskflow-pro-vpc"
  }
}


# ============================================================
# PUBLIC SUBNETS
# ============================================================

resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.taskflow_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "taskflow-public-1"
  }
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.taskflow_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "ap-south-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "taskflow-public-2"
  }
}


# ============================================================
# PRIVATE SUBNETS
# ============================================================

resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.taskflow_vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "ap-south-1a"

  tags = {
    Name = "taskflow-private-1"
  }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.taskflow_vpc.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "ap-south-1b"

  tags = {
    Name = "taskflow-private-2"
  }
}


# ============================================================
# INTERNET GATEWAY
# ============================================================

resource "aws_internet_gateway" "taskflow_igw" {
  vpc_id = aws_vpc.taskflow_vpc.id

  tags = {
    Name = "taskflow-internet-gateway"
  }
}


# ============================================================
# PUBLIC ROUTE TABLE
# ============================================================

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.taskflow_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.taskflow_igw.id
  }

  tags = {
    Name = "taskflow-public-route-table"
  }
}

resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}


# ============================================================
# NAT GATEWAY
# ============================================================

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "taskflow-nat-eip"
  }
}

resource "aws_nat_gateway" "taskflow_nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_1.id

  tags = {
    Name = "taskflow-nat-gateway"
  }

  depends_on = [
    aws_internet_gateway.taskflow_igw
  ]
}


# ============================================================
# PRIVATE ROUTE TABLE
# ============================================================

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.taskflow_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.taskflow_nat.id
  }

  tags = {
    Name = "taskflow-private-route-table"
  }
}

resource "aws_route_table_association" "private_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private.id
}


# ============================================================
# ALB SECURITY GROUP
# ============================================================

resource "aws_security_group" "alb" {
  name        = "taskflow-alb-sg"
  description = "Security group for TaskFlow-Pro ALB"
  vpc_id      = aws_vpc.taskflow_vpc.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "taskflow-alb-sg"
  }
}


# ============================================================
# ECS SECURITY GROUP
# ============================================================

resource "aws_security_group" "ecs" {
  name        = "taskflow-ecs-sg"
  description = "Security group for TaskFlow-Pro ECS services"
  vpc_id      = aws_vpc.taskflow_vpc.id

  # ALB -> ECS services
  ingress {
    description     = "Application traffic from ALB"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # ECS -> Eureka
  ingress {
    description = "Eureka discovery server"
    from_port   = 8761
    to_port     = 8761
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # Internal application communication
  ingress {
    description = "Internal ECS communication"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "taskflow-ecs-sg"
  }
}


# ============================================================
# RDS SECURITY GROUP
# ============================================================

resource "aws_security_group" "rds" {
  name        = "taskflow-rds-sg"
  description = "Security group for TaskFlow-Pro RDS"
  vpc_id      = aws_vpc.taskflow_vpc.id

  ingress {
    description     = "MySQL from ECS"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "taskflow-rds-sg"
  }
}


# ============================================================
# ECR REPOSITORIES
# ============================================================

resource "aws_ecr_repository" "user_service" {
  name                 = "taskflow-user-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "taskflow-user-service"
  }
}

resource "aws_ecr_repository" "project_service" {
  name                 = "taskflow-project-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "taskflow-project-service"
  }
}

resource "aws_ecr_repository" "task_service" {
  name                 = "taskflow-task-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "taskflow-task-service"
  }
}

resource "aws_ecr_repository" "notification_service" {
  name                 = "taskflow-notification-service"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "taskflow-notification-service"
  }
}


# ============================================================
# ECS CLUSTER
# ============================================================

resource "aws_ecs_cluster" "taskflow" {
  name = "taskflow-pro-cluster"

  tags = {
    Name = "taskflow-pro-cluster"
  }
}


# ============================================================
# ECS TASK EXECUTION IAM ROLE
# ============================================================

resource "aws_iam_role" "ecs_task_execution" {
  name = "taskflow-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "taskflow-ecs-task-execution-role"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}


# ============================================================
# USER SERVICE LOGS
# ============================================================

resource "aws_cloudwatch_log_group" "user_service" {
  name              = "/ecs/taskflow/user-service"
  retention_in_days = 7

  tags = {
    Name = "taskflow-user-service-logs"
  }
}


# ============================================================
# USER SERVICE TASK DEFINITION
# ============================================================

resource "aws_ecs_task_definition" "user_service" {
  family                   = "taskflow-user-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu    = "256"
  memory = "512"

  execution_role_arn = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "user-service"
      image     = "253924916082.dkr.ecr.ap-south-1.amazonaws.com/taskflow-user-service:latest"
      essential = true

      environment = [
        {
          name  = "DB_HOST"
          value = aws_db_instance.taskflow.address
        },
        {
          name  = "DB_PORT"
          value = "3306"
        },
        {
          name  = "DB_NAME"
          value = "taskflow"
        }
      ]

      secrets = [
        {
          name      = "DB_USERNAME"
          valueFrom = "${aws_secretsmanager_secret.taskflow_db.arn}:username::"
        },
        {
          name      = "DB_PASSWORD"
          valueFrom = "${aws_secretsmanager_secret.taskflow_db.arn}:password::"
        }
      ]

      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          awslogs-group         = "/ecs/taskflow/user-service"
          awslogs-region        = "ap-south-1"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = {
    Name = "taskflow-user-service-task"
  }
}


# ============================================================
# PROJECT SERVICE LOGS
# ============================================================

resource "aws_cloudwatch_log_group" "project_service" {
  name              = "/ecs/taskflow/project-service"
  retention_in_days = 7
}


# ============================================================
# PROJECT SERVICE TASK DEFINITION
# ============================================================

resource "aws_ecs_task_definition" "project_service" {
  family                   = "taskflow-project-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu    = "256"
  memory = "512"

  execution_role_arn = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "project-service"
      image     = "253924916082.dkr.ecr.ap-south-1.amazonaws.com/taskflow-project-service:latest"
      essential = true

      environment = [
        {
          name  = "DB_HOST"
          value = aws_db_instance.taskflow.address
        },
        {
          name  = "DB_PORT"
          value = "3306"
        },
        {
          name  = "DB_NAME"
          value = "taskflow"
        }
      ]

      secrets = [
        {
          name      = "DB_USERNAME"
          valueFrom = "${aws_secretsmanager_secret.taskflow_db.arn}:username::"
        },
        {
          name      = "DB_PASSWORD"
          valueFrom = "${aws_secretsmanager_secret.taskflow_db.arn}:password::"
        }
      ]

      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          awslogs-group         = "/ecs/taskflow/project-service"
          awslogs-region        = "ap-south-1"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}


# ============================================================
# TASK SERVICE LOGS
# ============================================================

resource "aws_cloudwatch_log_group" "task_service" {
  name              = "/ecs/taskflow/task-service"
  retention_in_days = 7
}


# ============================================================
# TASK SERVICE TASK DEFINITION
# ============================================================

resource "aws_ecs_task_definition" "task_service" {
  family                   = "taskflow-task-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu    = "256"
  memory = "512"

  execution_role_arn = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "task-service"
      image     = "253924916082.dkr.ecr.ap-south-1.amazonaws.com/taskflow-task-service:latest"
      essential = true

      environment = [
        {
          name  = "DB_HOST"
          value = aws_db_instance.taskflow.address
        },
        {
          name  = "DB_PORT"
          value = "3306"
        },
        {
          name  = "DB_NAME"
          value = "taskflow"
        }
      ]

      secrets = [
        {
          name      = "DB_USERNAME"
          valueFrom = "${aws_secretsmanager_secret.taskflow_db.arn}:username::"
        },
        {
          name      = "DB_PASSWORD"
          valueFrom = "${aws_secretsmanager_secret.taskflow_db.arn}:password::"
        }
      ]

      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          awslogs-group         = "/ecs/taskflow/task-service"
          awslogs-region        = "ap-south-1"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}


# ============================================================
# NOTIFICATION SERVICE LOGS
# ============================================================

resource "aws_cloudwatch_log_group" "notification_service" {
  name              = "/ecs/taskflow/notification-service"
  retention_in_days = 7
}


# ============================================================
# NOTIFICATION SERVICE TASK DEFINITION
# ============================================================

resource "aws_ecs_task_definition" "notification_service" {
  family                   = "taskflow-notification-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu    = "256"
  memory = "512"

  execution_role_arn = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "notification-service"
      image     = "253924916082.dkr.ecr.ap-south-1.amazonaws.com/taskflow-notification-service:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          awslogs-group         = "/ecs/taskflow/notification-service"
          awslogs-region        = "ap-south-1"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}


# ============================================================
# DISCOVERY SERVER / EUREKA LOGS
# ============================================================

resource "aws_cloudwatch_log_group" "discovery_server" {
  name              = "/ecs/taskflow/discovery-server"
  retention_in_days = 7
}


# ============================================================
# DISCOVERY SERVER TASK DEFINITION
# ============================================================

resource "aws_ecs_task_definition" "discovery_server" {
  family                   = "taskflow-discovery-server"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu    = "256"
  memory = "512"

  execution_role_arn = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "discovery-server"
      image     = "253924916082.dkr.ecr.ap-south-1.amazonaws.com/taskflow-discovery-server:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8761
          hostPort      = 8761
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          awslogs-group         = "/ecs/taskflow/discovery-server"
          awslogs-region        = "ap-south-1"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}


# ============================================================
# API GATEWAY LOGS
# ============================================================

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/ecs/taskflow/api-gateway"
  retention_in_days = 7
}


# ============================================================
# API GATEWAY TASK DEFINITION
# ============================================================

resource "aws_ecs_task_definition" "api_gateway" {
  family                   = "taskflow-api-gateway"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu    = "256"
  memory = "512"

  execution_role_arn = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "api-gateway"
      image     = "253924916082.dkr.ecr.ap-south-1.amazonaws.com/taskflow-api-gateway:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          awslogs-group         = "/ecs/taskflow/api-gateway"
          awslogs-region        = "ap-south-1"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}


# ============================================================
# APPLICATION LOAD BALANCER
# ============================================================

resource "aws_lb" "taskflow" {
  name               = "taskflow-pro-alb"
  internal           = false
  load_balancer_type = "application"

  security_groups = [
    aws_security_group.alb.id
  ]

  subnets = [
    aws_subnet.public_1.id,
    aws_subnet.public_2.id
  ]

  tags = {
    Name = "taskflow-pro-alb"
  }
}


# ============================================================
# API GATEWAY TARGET GROUP
# ============================================================

resource "aws_lb_target_group" "api_gateway" {
  name        = "taskflow-gateway-tg"
  port        = 8080
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.taskflow_vpc.id

  health_check {
    path                = "/actuator/health"
    protocol            = "HTTP"
    port                = "8080"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }

  tags = {
    Name = "taskflow-api-gateway-target-group"
  }
}


# ============================================================
# USER SERVICE TARGET GROUP
# ============================================================


# ============================================================
# ALB LISTENER
# ============================================================

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.taskflow.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_gateway.arn
  }
}


# ============================================================
# ECS USER SERVICE
# ============================================================

resource "aws_ecs_service" "user_service" {
  name            = "taskflow-user-service"
  cluster         = aws_ecs_cluster.taskflow.id
  task_definition = aws_ecs_task_definition.user_service.arn

  desired_count = 1
  launch_type   = "FARGATE"

  network_configuration {
    subnets = [
      aws_subnet.private_1.id,
      aws_subnet.private_2.id
    ]

    security_groups = [
      aws_security_group.ecs.id
    ]

    assign_public_ip = false
  }
}


# ============================================================
# ECS PROJECT SERVICE
# ============================================================

resource "aws_ecs_service" "project_service" {
  name            = "taskflow-project-service"
  cluster         = aws_ecs_cluster.taskflow.id
  task_definition = aws_ecs_task_definition.project_service.arn

  desired_count = 1
  launch_type   = "FARGATE"

  network_configuration {
    subnets = [
      aws_subnet.private_1.id,
      aws_subnet.private_2.id
    ]

    security_groups = [
      aws_security_group.ecs.id
    ]

    assign_public_ip = false
  }
}


# ============================================================
# ECS TASK SERVICE
# ============================================================

resource "aws_ecs_service" "task_service" {
  name            = "taskflow-task-service"
  cluster         = aws_ecs_cluster.taskflow.id
  task_definition = aws_ecs_task_definition.task_service.arn

  desired_count = 1
  launch_type   = "FARGATE"

  network_configuration {
    subnets = [
      aws_subnet.private_1.id,
      aws_subnet.private_2.id
    ]

    security_groups = [
      aws_security_group.ecs.id
    ]

    assign_public_ip = false
  }
}


# ============================================================
# ECS NOTIFICATION SERVICE
# ============================================================

resource "aws_ecs_service" "notification_service" {
  name            = "taskflow-notification-service"
  cluster         = aws_ecs_cluster.taskflow.id
  task_definition = aws_ecs_task_definition.notification_service.arn

  desired_count = 1
  launch_type   = "FARGATE"

  network_configuration {
    subnets = [
      aws_subnet.private_1.id,
      aws_subnet.private_2.id
    ]

    security_groups = [
      aws_security_group.ecs.id
    ]

    assign_public_ip = false
  }
}


# ============================================================
# ECS DISCOVERY SERVER SERVICE
# ============================================================

resource "aws_ecs_service" "discovery_server" {
  name            = "taskflow-discovery-server"
  cluster         = aws_ecs_cluster.taskflow.id
  task_definition = aws_ecs_task_definition.discovery_server.arn

  desired_count = 1
  launch_type   = "FARGATE"

  network_configuration {
    subnets = [
      aws_subnet.private_1.id,
      aws_subnet.private_2.id
    ]

    security_groups = [
      aws_security_group.ecs.id
    ]

    assign_public_ip = false
  }
}


# ============================================================
# ECS API GATEWAY SERVICE
# ============================================================

resource "aws_ecs_service" "api_gateway" {
  name            = "taskflow-api-gateway"
  cluster         = aws_ecs_cluster.taskflow.id
  task_definition = aws_ecs_task_definition.api_gateway.arn

  desired_count = 1
  launch_type   = "FARGATE"

  network_configuration {
    subnets = [
      aws_subnet.private_1.id,
      aws_subnet.private_2.id
    ]

    security_groups = [
      aws_security_group.ecs.id
    ]

    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api_gateway.arn
    container_name   = "api-gateway"
    container_port   = 8080
  }

  depends_on = [
    aws_lb_listener.http
  ]
}


# ============================================================
# RDS SUBNET GROUP
# ============================================================

resource "aws_db_subnet_group" "taskflow" {
  name = "taskflow-rds-subnet-group"

  subnet_ids = [
    aws_subnet.private_1.id,
    aws_subnet.private_2.id
  ]

  tags = {
    Name = "taskflow-rds-subnet-group"
  }
}


# ============================================================
# RDS MYSQL DATABASE
# ============================================================

# Auto-generated at apply time - never hardcoded, never appears in
# state as plaintext in this file. AWS RDS forbids '/', '"', '@', and
# space in the master password, so those are excluded below.
resource "random_password" "db" {
  length           = 24
  special          = true
  override_special = "!#$%^&*()-_=+[]{}<>?"
}

resource "aws_db_instance" "taskflow" {
  identifier = "taskflow-pro-db"

  engine         = "mysql"
  engine_version = "8.0"

  instance_class        = "db.t3.micro"
  allocated_storage     = 20
  max_allocated_storage = 50
  storage_type          = "gp3"

  db_name  = "taskflow"
  username = "admin"
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.taskflow.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  publicly_accessible = false
  multi_az            = false

  backup_retention_period = 0

  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name = "taskflow-pro-db"
  }
}


# ============================================================
# SECRETS MANAGER
# ============================================================

resource "aws_secretsmanager_secret" "taskflow_db" {
  name = "taskflow/pro/database"

  tags = {
    Name = "taskflow-pro-database-secret"
  }
}

resource "aws_secretsmanager_secret_version" "taskflow_db" {
  secret_id = aws_secretsmanager_secret.taskflow_db.id

  # IMPORTANT:
  # This password MUST match the password of the existing RDS instance.

  secret_string = jsonencode({
    username = "admin"
    password = random_password.db.result
    host     = aws_db_instance.taskflow.address
    port     = 3306
    database = "taskflow"
  })
}


# ============================================================
# ECS SECRET ACCESS POLICY
# ============================================================

resource "aws_iam_role_policy" "ecs_secrets_access" {
  name = "taskflow-ecs-secrets-access"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "secretsmanager:GetSecretValue"
        ]

        Resource = aws_secretsmanager_secret.taskflow_db.arn
      }
    ]
  })
}

# ============================================================
# S3 BUCKET - PROFILE IMAGE UPLOADS
# ============================================================

resource "random_id" "profile_images_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "profile_images" {
  bucket = "taskflow-pro-profile-images-${random_id.profile_images_suffix.hex}"

  tags = {
    Name = "taskflow-pro-profile-images"
  }
}

# Profile pictures are served as plain public URLs (see S3Service.buildFileUrl
# in user-service), so the bucket needs public GET access - but only under the
# profile-images/ prefix that the app actually writes to.
resource "aws_s3_bucket_public_access_block" "profile_images" {
  bucket = aws_s3_bucket.profile_images.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "profile_images_public_read" {
  bucket     = aws_s3_bucket.profile_images.id
  depends_on = [aws_s3_bucket_public_access_block.profile_images]

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid       = "PublicReadProfileImages"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.profile_images.arn}/profile-images/*"
      }
    ]
  })
}


# ============================================================
# S3 PROFILE IMAGES - APPLICATION IAM USER
# ============================================================

# A dedicated IAM user, scoped only to this bucket's profile-images/ prefix,
# for user-service to use via AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.
# Do NOT reuse a broader-permission key here.
resource "aws_iam_user" "profile_images_uploader" {
  name = "taskflow-profile-images-uploader"

  tags = {
    Name = "taskflow-pro-profile-images-uploader"
  }
}

resource "aws_iam_user_policy" "profile_images_uploader" {
  name = "taskflow-profile-images-s3-access"
  user = aws_iam_user.profile_images_uploader.name

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]

        Resource = "${aws_s3_bucket.profile_images.arn}/profile-images/*"
      },
      {
        Effect   = "Allow"
        Action   = "s3:ListBucket"
        Resource = aws_s3_bucket.profile_images.arn
      }
    ]
  })
}

resource "aws_iam_access_key" "profile_images_uploader" {
  user = aws_iam_user.profile_images_uploader.name
}

output "profile_images_bucket_name" {
  description = "Set as AWS_S3_BUCKET in .env"
  value       = aws_s3_bucket.profile_images.bucket
}

output "profile_images_access_key_id" {
  description = "Set as AWS_ACCESS_KEY_ID in .env"
  value       = aws_iam_access_key.profile_images_uploader.id
  sensitive   = true
}

output "profile_images_secret_access_key" {
  description = "Set as AWS_SECRET_ACCESS_KEY in .env"
  value       = aws_iam_access_key.profile_images_uploader.secret
  sensitive   = true
}


# ============================================================
# ECR REPOSITORIES - discovery-server & api-gateway
# ============================================================
# These two task definitions (above) already reference ECR image URLs
# for these repos, and it turns out the repos already exist in AWS
# (created outside this Terraform config, before it tracked them) -
# a `resource` block here collides with that (RepositoryAlreadyExists).
# Reference them as data instead of trying to (re)create them.

data "aws_ecr_repository" "discovery_server" {
  name = "taskflow-discovery-server"
}

data "aws_ecr_repository" "api_gateway" {
  name = "taskflow-api-gateway"
}


# ============================================================
# JENKINS CI/CD - IAM USER
# ============================================================
# Scoped to exactly what the pipeline needs: push images to this app's
# six ECR repos, and roll a new deployment on this app's ECS services
# in this app's cluster only. Nothing broader.

data "aws_caller_identity" "current" {}

resource "aws_iam_user" "jenkins_cicd" {
  name = "taskflow-jenkins-cicd"

  tags = {
    Name = "taskflow-jenkins-cicd"
  }
}

resource "aws_iam_user_policy" "jenkins_cicd" {
  name = "taskflow-jenkins-ecr-ecs-deploy"
  user = aws_iam_user.jenkins_cicd.name

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid      = "ECRAuth"
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Sid    = "ECRPushPull"
        Effect = "Allow"

        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage",
          "ecr:BatchGetImage",
          "ecr:DescribeRepositories",
          "ecr:DescribeImages"
        ]

        Resource = [
          aws_ecr_repository.user_service.arn,
          aws_ecr_repository.project_service.arn,
          aws_ecr_repository.task_service.arn,
          aws_ecr_repository.notification_service.arn,
          data.aws_ecr_repository.discovery_server.arn,
          data.aws_ecr_repository.api_gateway.arn
        ]
      },
      {
        Sid    = "ECSRollDeployment"
        Effect = "Allow"

        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:ListTasks",
          "ecs:DescribeTasks"
        ]

        Resource = "*"

        Condition = {
          ArnEquals = {
            "ecs:cluster" = aws_ecs_cluster.taskflow.arn
          }
        }
      },
      {
        # DescribeTaskDefinition doesn't support resource-level scoping -
        # read-only metadata, no secrets are exposed in the response.
        Sid      = "ECSDescribeTaskDefinition"
        Effect   = "Allow"
        Action   = ["ecs:DescribeTaskDefinition"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_access_key" "jenkins_cicd" {
  user = aws_iam_user.jenkins_cicd.name
}

output "jenkins_cicd_access_key_id" {
  description = "Jenkins credential 'aws-ecr-credentials' (Username) - AWS access key ID"
  value       = aws_iam_access_key.jenkins_cicd.id
  sensitive   = true
}

output "jenkins_cicd_secret_access_key" {
  description = "Jenkins credential 'aws-ecr-credentials' (Password) - AWS secret access key"
  value       = aws_iam_access_key.jenkins_cicd.secret
  sensitive   = true
}
