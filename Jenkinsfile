pipeline {
  agent any

  environment {
    NODE_VERSION = '18'
    DEPLOY_DIR = '/var/www/Creditor_UserDash'
    BACKUP_DIR = '/var/www/Creditor_UserDash_backup'
    INSTANCE_ID = 'i-0dd6204cbaa558ffc'
    REGION = 'us-east-1'   // ✅ Region only, not AZ
  }

  stages {

    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/Creditor-Academy/Creditor_UserDash.git'
      }
    }

    stage('Setup Node') {
      steps {
        sh '''
          echo "Using Node version ${NODE_VERSION}"
          nvm install ${NODE_VERSION} || true
          nvm use ${NODE_VERSION} || true
        '''
      }
    }

    stage('Build') {
      steps {
        sh '''
          npm ci
          npm run build
        '''
      }
    }

    stage('Deploy via AWS SSM') {
      steps {
        withAWS(region: "${REGION}", credentials: 'aws-jenkins-creds') {
          sh '''
            aws ssm send-command \
              --instance-ids ${INSTANCE_ID} \
              --document-name "AWS-RunShellScript" \
              --comment "Deploying new build from Jenkins with backup" \
              --parameters '{"commands":[
                "set -e",
                "if [ -d ${DEPLOY_DIR} ]; then sudo rm -rf ${BACKUP_DIR}; sudo cp -r ${DEPLOY_DIR} ${BACKUP_DIR}; fi",
                "sudo rm -rf ${DEPLOY_DIR}/*",
                "sudo cp -r dist/* ${DEPLOY_DIR}/",
                "sudo chown -R www-data:www-data ${DEPLOY_DIR}",
                "sudo systemctl reload nginx"
              ]}' \
              --region ${REGION}
          '''
        }
      }
    }
  }

  post {
    success {
      echo '✅ Deployment successful! Backup created at /var/www/Creditor_UserDash_backup'
    }
    failure {
      echo '❌ Deployment failed. Check Jenkins logs.'
    }
  }
}
