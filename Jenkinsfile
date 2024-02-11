pipeline {
    agent any
    tools {
        nodejs 'Node18.15'
    }

    environment {
        DOCKER_REGISTRY = 'darkedson/test-repo'
        NODE_IMAGE = 'Node18.15'
        SONARQUBE_SERVER = 'SonarQ'
        DOCKER_IMAGE_NAME = 'devops-nodejs'
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
        
        stage('Run tests') {
            agent any
            steps {
                sh 'npm test'
            }
        }
        
        stage('SonarQube analysis') {
            agent any
            environment {
                SCANNER_HOME = tool 'sonarqube'
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
                }
            }
        }
        
        stage('Run Docker Container') {
            agent any
            steps {
                script {
                    docker.image("${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}").run("--name ${DOCKER_IMAGE_NAME}-${env.BUILD_NUMBER} -d")
                }
            }
        }
    }
}
