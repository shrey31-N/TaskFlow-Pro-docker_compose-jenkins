pipeline {

    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID = '253924916082'
        ECR_REGISTRY = '253924916082.dkr.ecr.ap-south-1.amazonaws.com'
    }

    stages {

        // =====================================================
        // 1. CHECKOUT
        // =====================================================

        stage('Checkout') {
            steps {
                checkout scm
            }
        }


        // =====================================================
        // 2. DOCKER VERIFICATION
        // =====================================================

        stage('Docker Verification') {
            steps {
                bat '''
                echo ========================================
                echo        DOCKER VERSION
                echo ========================================

                docker --version

                echo ========================================
                echo        DOCKER INFO
                echo ========================================

                docker info

                echo ========================================
                echo        EXISTING IMAGES
                echo ========================================

                docker images
                '''
            }
        }


        // =====================================================
        // 3. USER SERVICE
        // =====================================================

        stage('Build User Service') {
            steps {
                dir('backend/user-service') {
                    bat 'mvnw.cmd package -DskipTests'
                }
            }
        }

        stage('Test User Service') {
            steps {
                dir('backend/user-service') {
                    bat 'mvnw.cmd test'
                }
            }
        }


        // =====================================================
        // 4. PROJECT SERVICE
        // =====================================================

        stage('Build Project Service') {
            steps {
                dir('backend/project-service') {
                    bat 'mvnw.cmd package -DskipTests'
                }
            }
        }

        stage('Test Project Service') {
            steps {
                dir('backend/project-service') {
                    bat 'mvnw.cmd test'
                }
            }
        }


        // =====================================================
        // 5. TASK SERVICE
        // =====================================================

        stage('Build Task Service') {
            steps {
                dir('backend/task-service') {
                    bat 'mvnw.cmd package -DskipTests'
                }
            }
        }

        /*
         * Task Service integration tests are currently skipped.
         *
         * Reason:
         * The integration tests depend on other microservices/Eureka.
         *
         * We will address this after the deployment pipeline is working.
         */


        // =====================================================
        // 6. NOTIFICATION SERVICE
        // =====================================================

        stage('Build Notification Service') {
            steps {
                dir('backend/notification-service') {
                    bat 'mvnw.cmd package -DskipTests'
                }
            }
        }

        stage('Test Notification Service') {
            steps {
                dir('backend/notification-service') {
                    bat 'mvnw.cmd test'
                }
            }
        }


        // =====================================================
        // 7. API GATEWAY
        // =====================================================

        stage('Build API Gateway') {
            steps {
                dir('backend/api-gateway') {
                    bat 'mvnw.cmd package -DskipTests'
                }
            }
        }

        stage('Test API Gateway') {
            steps {
                dir('backend/api-gateway') {
                    bat 'mvnw.cmd test'
                }
            }
        }


        // =====================================================
        // 8. DISCOVERY / EUREKA SERVER
        // =====================================================

        stage('Build Discovery Server') {
            steps {
                dir('backend/discovery-server') {
                    bat 'mvn.cmd package -DskipTests'
                }
            }
        }


        // =====================================================
        // 9. DOCKER BUILD
        // =====================================================

        stage('Docker Build') {
            steps {

                bat '''
                echo ========================================
                echo        BUILD USER SERVICE IMAGE
                echo ========================================

                docker build -t taskflow-user-service:ci backend\\user-service


                echo ========================================
                echo        BUILD PROJECT SERVICE IMAGE
                echo ========================================

                docker build -t taskflow-project-service:ci backend\\project-service


                echo ========================================
                echo        BUILD TASK SERVICE IMAGE
                echo ========================================

                docker build -t taskflow-task-service:ci backend\\task-service


                echo ========================================
                echo        BUILD NOTIFICATION SERVICE IMAGE
                echo ========================================

                docker build -t taskflow-notification-service:ci backend\\notification-service


                echo ========================================
                echo        BUILD API GATEWAY IMAGE
                echo ========================================

                docker build -t taskflow-api-gateway:ci backend\\api-gateway


                echo ========================================
                echo        BUILD DISCOVERY SERVER IMAGE
                echo ========================================

                docker build -t taskflow-discovery-server:ci backend\\discovery-server
                '''
            }
        }


        // =====================================================
        // 10. VERIFY DOCKER IMAGES
        // =====================================================

        stage('Verify Docker Images') {
            steps {

                bat '''
                echo ========================================
                echo        TASKFLOW DOCKER IMAGES
                echo ========================================

                docker images taskflow-user-service

                docker images taskflow-project-service

                docker images taskflow-task-service

                docker images taskflow-notification-service

                docker images taskflow-api-gateway

                docker images taskflow-discovery-server
                '''
            }
        }


        // =====================================================
        // 11. AWS IDENTITY CHECK
        // =====================================================

        stage('AWS Identity Check') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-ecr-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    bat '''
                    echo AWS CLI:
                    aws --version

                    echo AWS Identity:
                    aws sts get-caller-identity
                    '''
                }
            }
        }


        // =====================================================
        // 12. ECR LOGIN
        // =====================================================

        stage('ECR Login') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-ecr-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {

                    bat '''
                    echo        AMAZON ECR LOGIN

                    aws ecr get-login-password --region %AWS_REGION% | docker login --username AWS --password-stdin %ECR_REGISTRY%
                    '''
                }
            }
        }


        // =====================================================
        // 13. PUSH DOCKER IMAGES TO ECR
        // =====================================================

        stage('Docker Tag and Push to ECR') {
            steps {

                bat '''
                echo ========================================
                echo        PUSH USER SERVICE
                echo ========================================

                docker tag taskflow-user-service:ci %ECR_REGISTRY%/taskflow-user-service:ci
                docker push %ECR_REGISTRY%/taskflow-user-service:ci

                docker tag taskflow-user-service:ci %ECR_REGISTRY%/taskflow-user-service:latest
                docker push %ECR_REGISTRY%/taskflow-user-service:latest


                echo ========================================
                echo        PUSH PROJECT SERVICE
                echo ========================================

                docker tag taskflow-project-service:ci %ECR_REGISTRY%/taskflow-project-service:ci
                docker push %ECR_REGISTRY%/taskflow-project-service:ci

                docker tag taskflow-project-service:ci %ECR_REGISTRY%/taskflow-project-service:latest
                docker push %ECR_REGISTRY%/taskflow-project-service:latest


                echo ========================================
                echo        PUSH TASK SERVICE
                echo ========================================

                docker tag taskflow-task-service:ci %ECR_REGISTRY%/taskflow-task-service:ci
                docker push %ECR_REGISTRY%/taskflow-task-service:ci

                docker tag taskflow-task-service:ci %ECR_REGISTRY%/taskflow-task-service:latest
                docker push %ECR_REGISTRY%/taskflow-task-service:latest


                echo ========================================
                echo        PUSH NOTIFICATION SERVICE
                echo ========================================

                docker tag taskflow-notification-service:ci %ECR_REGISTRY%/taskflow-notification-service:ci
                docker push %ECR_REGISTRY%/taskflow-notification-service:ci

                docker tag taskflow-notification-service:ci %ECR_REGISTRY%/taskflow-notification-service:latest
                docker push %ECR_REGISTRY%/taskflow-notification-service:latest


                echo ========================================
                echo        PUSH API GATEWAY
                echo ========================================

                docker tag taskflow-api-gateway:ci %ECR_REGISTRY%/taskflow-api-gateway:ci
                docker push %ECR_REGISTRY%/taskflow-api-gateway:ci

                docker tag taskflow-api-gateway:ci %ECR_REGISTRY%/taskflow-api-gateway:latest
                docker push %ECR_REGISTRY%/taskflow-api-gateway:latest


                echo ========================================
                echo        PUSH DISCOVERY SERVER
                echo ========================================

                docker tag taskflow-discovery-server:ci %ECR_REGISTRY%/taskflow-discovery-server:ci
                docker push %ECR_REGISTRY%/taskflow-discovery-server:ci

                docker tag taskflow-discovery-server:ci %ECR_REGISTRY%/taskflow-discovery-server:latest
                docker push %ECR_REGISTRY%/taskflow-discovery-server:latest
                '''
            }
        }


        // =====================================================
        // 14. VERIFY ECR IMAGES
        // =====================================================

        stage('Verify ECR Images') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-ecr-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {

                    bat '''
                    echo ========================================
                    echo        VERIFY ECR IMAGES
                    echo ========================================

                    aws ecr describe-images --repository-name taskflow-user-service --region %AWS_REGION% --query "imageDetails[].imageTags" --output table

                    aws ecr describe-images --repository-name taskflow-project-service --region %AWS_REGION% --query "imageDetails[].imageTags" --output table

                    aws ecr describe-images --repository-name taskflow-task-service --region %AWS_REGION% --query "imageDetails[].imageTags" --output table

                    aws ecr describe-images --repository-name taskflow-notification-service --region %AWS_REGION% --query "imageDetails[].imageTags" --output table

                    aws ecr describe-images --repository-name taskflow-api-gateway --region %AWS_REGION% --query "imageDetails[].imageTags" --output table

                    aws ecr describe-images --repository-name taskflow-discovery-server --region %AWS_REGION% --query "imageDetails[].imageTags" --output table
                    '''
                }
            }
        }


        // =====================================================
        // 15. DEPLOY TO ECS
        // =====================================================
        //
        // Rolls a fresh deployment on each ECS service, which pulls
        // whatever image is currently tagged :latest in ECR (pushed
        // above). This does NOT touch the task definition itself -
        // that's still owned by Terraform - so there's no drift
        // between what Terraform applied and what's running.

        stage('Deploy to ECS') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-ecr-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {

                    bat '''
                    echo ========================================
                    echo        ROLL NEW ECS DEPLOYMENTS
                    echo ========================================

                echo ========================================
                echo        DEPLOY TASKFLOW-USER-SERVICE
                echo ========================================

                aws ecs update-service --cluster taskflow-pro-cluster --service taskflow-user-service --force-new-deployment --region %AWS_REGION%

                echo ========================================
                echo        DEPLOY TASKFLOW-PROJECT-SERVICE
                echo ========================================

                aws ecs update-service --cluster taskflow-pro-cluster --service taskflow-project-service --force-new-deployment --region %AWS_REGION%

                echo ========================================
                echo        DEPLOY TASKFLOW-TASK-SERVICE
                echo ========================================

                aws ecs update-service --cluster taskflow-pro-cluster --service taskflow-task-service --force-new-deployment --region %AWS_REGION%

                echo ========================================
                echo        DEPLOY TASKFLOW-NOTIFICATION-SERVICE
                echo ========================================

                aws ecs update-service --cluster taskflow-pro-cluster --service taskflow-notification-service --force-new-deployment --region %AWS_REGION%

                echo ========================================
                echo        DEPLOY TASKFLOW-API-GATEWAY
                echo ========================================

                aws ecs update-service --cluster taskflow-pro-cluster --service taskflow-api-gateway --force-new-deployment --region %AWS_REGION%

                echo ========================================
                echo        DEPLOY TASKFLOW-DISCOVERY-SERVER
                echo ========================================

                aws ecs update-service --cluster taskflow-pro-cluster --service taskflow-discovery-server --force-new-deployment --region %AWS_REGION%

                    '''
                }
            }
        }


        // =====================================================
        // 16. WAIT FOR ECS SERVICES TO STABILIZE
        // =====================================================

        stage('Wait for ECS Stability') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-ecr-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {

                    bat '''
                    echo ========================================
                    echo        WAIT FOR STABLE DEPLOYMENTS
                    echo ========================================

                echo Waiting for taskflow-user-service to stabilize...
                aws ecs wait services-stable --cluster taskflow-pro-cluster --services taskflow-user-service --region %AWS_REGION%

                echo Waiting for taskflow-project-service to stabilize...
                aws ecs wait services-stable --cluster taskflow-pro-cluster --services taskflow-project-service --region %AWS_REGION%

                echo Waiting for taskflow-task-service to stabilize...
                aws ecs wait services-stable --cluster taskflow-pro-cluster --services taskflow-task-service --region %AWS_REGION%

                echo Waiting for taskflow-notification-service to stabilize...
                aws ecs wait services-stable --cluster taskflow-pro-cluster --services taskflow-notification-service --region %AWS_REGION%

                echo Waiting for taskflow-api-gateway to stabilize...
                aws ecs wait services-stable --cluster taskflow-pro-cluster --services taskflow-api-gateway --region %AWS_REGION%

                echo Waiting for taskflow-discovery-server to stabilize...
                aws ecs wait services-stable --cluster taskflow-pro-cluster --services taskflow-discovery-server --region %AWS_REGION%

                    '''
                }
            }
        }
    }


    // =========================================================
    // PIPELINE RESULT
    // =========================================================

    post {

        success {
            echo '''
            ========================================
            TASKFLOW-PRO CI/CD PIPELINE SUCCESSFUL
            ========================================

            Checkout              : SUCCESS
            Maven Build           : SUCCESS
            Maven Tests           : SUCCESS
            Docker Build          : SUCCESS
            Docker Verification   : SUCCESS
            AWS Authentication    : SUCCESS
            ECR Login             : SUCCESS
            Docker Push to ECR    : SUCCESS
            ECR Verification      : SUCCESS
            Deploy to ECS         : SUCCESS
            Wait for ECS Stability: SUCCESS

            ========================================
            All six ECS services are now running the
            image just pushed to ECR.
            ========================================
            '''
        }

        failure {
            echo '''
            ========================================
            TASKFLOW-PRO PIPELINE FAILED
            ========================================

            Check the failed stage above.

            ========================================
            '''
        }
    }
}