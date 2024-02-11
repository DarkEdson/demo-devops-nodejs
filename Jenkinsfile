pipeline {
    agent any
    tools {
        nodejs 'Node18.15'
    }

    environment {
        DOCKER_REGISTRY = 'darkedson'
        NODE_IMAGE = 'Node18.15'
        SONARQUBE_SERVER = 'SonarQ'
        DOCKER_IMAGE_NAME = 'test-repo'
    }

    stages {
        stage('Checkout'){
            agent any
            steps{
                git branch: 'develop',
                credentialsId: 'github2',
                url: 'git@github.com:DarkEdson/demo-devops-nodejs.git'
            }
        }

        stage('Install kubectl') {
            agent any
            steps {
                // Instalar kubectl en el contenedor de Jenkins
                sh 'curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl'
                sh 'chmod +x ./kubectl'
                sh 'mv ./kubectl /usr/local/bin/kubectl'
            }
        }
        stage('Install dependencies') {
            agent any
            steps {
                sh 'npm install'
            }
        }
        
        stage('Run tests and generate coverage report') {
            agent any
            steps {
                sh 'echo TESTS'
            }
            post {
                always {
                    sh 'nyc --reporter=lcov --report-dir=coverage npm test'
                    publishHTML(target: [allowMissing: false, alwaysLinkToLastBuild: true, keepAll: true, reportDir: 'coverage', reportFiles: 'index.html', reportName: 'Code Coverage Report',reportTitles: 'The Code Coverage Report'])
                }
    }
        }
        
        stage('SonarQube analysis') {
            agent any
            environment {
                SCANNER_HOME = tool 'SonarQ'
            }
            steps {
                withSonarQubeEnv(SONARQUBE_SERVER) {
                    sh "${SCANNER_HOME}/bin/sonar-scanner"
                }
            }
        }
        
        stage("Quality Gate") {
            agent any
            steps {
                timeout(time: 20, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Dockerize') {
            agent any
            steps {
                script {
                    docker.build("${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}")
                }
            }
        }
        
        stage('Push to DockerHub') {
            agent any
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-credentials') {
                        docker.image("${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}").push("${env.BUILD_NUMBER}")
                    }
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-credentials') {
                        docker.image("${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}").push("latest")
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            agent any
            steps {
                sh 'kubectl apply -f deployment-config.yaml'
            }
        }

        stage('Check Deployment') {
            agent any
            steps {
                sh 'kubectl get pods' 
            }
        }

        stage('Check Health') {
            agent any
            steps {
                script {
                    def response = sh(script: "curl -s -o /dev/null -w '%{http_code}' --max-time 90 http://mi-aplicacion.com/health", returnStdout: true).trim()
                    if (response == '200') {
                        echo 'Health check passed'
                    } else {
                        error "Health check failed: HTTP status code $response"
                    }
                }
            }
        }
    }
}
