pipeline {
    agent any
    stages{
        stage("Checkout"){
            steps{
                echo "checking out the Taskflow-pro project........."
                checkout scm
            }
        }
        stage("Docker verification"){
            steps{
                echo "verifying the docker images........"
                sh "docker --version"
            }
        }
        stage('Build Microservices at once') {
            steps {

                dir('backend/discovery-server') {
                    bat 'mvn clean package -DskipTests'
                }

                dir('backend/api-gateway') {
                    bat 'mvn clean package -DskipTests'
                    bat 'mvnw.cmd test'
                }

                dir('backend/user-service') {
                    bat 'mvn clean package -DskipTests'
                    bat 'mvnw.cmd test'
                }

                dir('backend/project-service') {
                    bat 'mvn clean package -DskipTests'
                    bat 'mvnw.cmd test'
                }

                dir('backend/task-service') {
                    bat 'mvn clean package -DskipTests'
                    bat 'mvnw.cmd test'
                }

                dir('backend/notification-service') {
                    bat 'mvn clean package -DskipTests'
                    bat 'mvnw.cmd test'
                }
            }
        }

        stage("Docker compose configuration verification"){
            steps{
                echo "configuring the docker compose........"
                bat "docker compose config"
            }
        }
        
        stage("Docker build"){
            steps{
                echo "building the docker images........"
                bat "docker compose build"
            }
        }
        stage("Deploy"){
            steps{
                echo "deploying the taskflow-pro........"
                bat "docker compose up -d"
            }
        }
    }
    post{
        success{
            echo "Taskflow-pro pipeline completed successfully....!"
        }
        failure{
            echo "Taskflow-pro pipeline failed......!"
        }
    }
}