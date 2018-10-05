pipeline {

    // agent any
    agent {
        docker {
            image 'occ-docker-jenkins'
            args '-u root --privileged'
        }
    }

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
                script {
                    // docker.build("occ-docker-jenkins")
                    docker.build()
                }
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