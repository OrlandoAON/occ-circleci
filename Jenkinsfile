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
                    docker.build("occ-docker-jenkins")
                    // docker.build()
                }
               // echo 'Not working. T-T'
            }
        }
        stage('Deploy') {
            steps {
               // echo 'I give up! let\'s drink some beers!'
               sh "cd src/"
               sh "dcu -n https://ccadmin-zaja.oracleoutsourcing.com -k eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiMjRhY2M2MS0zYTQ4LTQ5ZGQtYmJjNS04OWVmMmY3M2E4YjMiLCJpc3MiOiJhcHBsaWNhdGlvbkF1dGgiLCJleHAiOjE1NzAxMjE1NjgsImlhdCI6MTUzODU4NTU2OH0=.1RED6oQXbnrZyPpYaIexDKuM+FkTwV7nG7Z6turf7ZU= -m /theme"
            }
        }
    }
}