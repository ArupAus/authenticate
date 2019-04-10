pipeline {
  agent any
  stages {
    stage('setup'){
      steps {
        sh "npm install"
      }
    }
    // stage('lint'){
    //   steps {
    //     sh "npm run lint"
    //   }
    // }
    stage('test'){
      steps {
        sh "npm test"
      }
    }
    stage('build') {
      steps {
        sh "npm run build"
      }
    }

  }
}
