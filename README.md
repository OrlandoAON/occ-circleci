# occ-docker-jenkins
Testing integration between OCC and Jenkins usind Docker.

# creating our image:

docker image build --tag occ-docker-jenkins:latest .

docker run -it --rm occ-docker-jenkins:latest bash (to check if everything is ok)

docker run -p 8080:8080 -p 50000:50000 jenkins/jenkins:lts
