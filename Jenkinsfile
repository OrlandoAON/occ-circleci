pipeline {
    // environment {
    //     BUILD_SCRIPTS_GIT="https://github.com/OrlandoAON/occ-docker-jenkins.git"
    //     BUILD_SCRIPTS='mypipeline'
    //     BUILD_HOME='/var/lib/jenkins/workspace'
    // }
     stages {
        stage('Checkout') {
            steps {
                script {
                    scmvar = checkout scm
                    echo scmvar
                }
                echo 'Not working at all! :('
            }
        }
        stage('build') {
            steps {
                echo 'Not working. T-T'
            }
        }
        stage('deploy') {
            steps {
                echo 'I give up! let\'s drink some beers!'
            }
        }
    }
}