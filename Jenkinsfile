pipeline {

    agent any

     stages {
        stage('Checkout') {
            steps {
                script {
                    scmvar = checkout scm
                    // echo scmvar
                }
            //    echo 'Not working at all! :('
            }
        }
        stage('Build') {
            steps {
                docker.build("occ-docker-jenkins")
                echo 'Not working. T-T'
            }
        }
        stage('Deploy') {
            steps {
                echo 'I give up! let\'s drink some beers!'
            }
        }
    }
}