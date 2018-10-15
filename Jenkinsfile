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
            }
        }
        stage('Build') {
            steps {
                script {
                    app = docker.build("occ-docker-jenkins")
                }
            }
        }
        stage('Deploy') {
            steps {
               dir('src') {
                    app.inside {
                        sh "dcu -n https://ccadmin-zaja.oracleoutsourcing.com -k eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiMjRhY2M2MS0zYTQ4LTQ5ZGQtYmJjNS04OWVmMmY3M2E4YjMiLCJpc3MiOiJhcHBsaWNhdGlvbkF1dGgiLCJleHAiOjE1NzAxMjE1NjgsImlhdCI6MTUzODU4NTU2OH0=.1RED6oQXbnrZyPpYaIexDKuM+FkTwV7nG7Z6turf7ZU= -m /theme"
                    }
               }
            }
        }
    }
}