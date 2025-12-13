pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                // Use the branch Jenkins is building (multibranch-friendly)
                checkout scm
                sh 'echo "Building branch: $(git rev-parse --abbrev-ref HEAD)"'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm run test:run'
            }
        }

        stage('Clean Old Build in Jenkins Workspace') {
            steps {
                sh 'rm -rf dist'
            }
        }

        stage('Build App') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy to Nginx Folder') { 
            steps {
                sh '''

                    echo " Copying new build files..."
                    sudo cp -r dist/* /var/www/Creditor_UserDash/dist/

                    echo " Setting permissions..."
                    sudo chown -R www-data:www-data /var/www/Creditor_UserDash/dist

                    echo " Reloading Nginx..."
                    sudo systemctl reload nginx

                    echo " Deployment Completed Successfully!"
                '''
            }
        }
    }

    post {
        success {
            echo ' Pipeline executed successfully!'
        }
        failure {
            echo ' Pipeline failed!'
        }
    }
}
