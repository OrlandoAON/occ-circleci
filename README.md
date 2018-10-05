# occ-docker-jenkins
Testing integration between OCC and Jenkins usind Docker.

# creating our image:

docker image build --tag occ-docker-jenkins:latest .

docker run -it --rm occ-docker-jenkins:latest bash (to check if everything is ok)

docker run -p 8080:8080 -p 50000:50000 -v /var/run/docker.sock:/var/run/docker.sock jenkins/jenkins:lts


docker exec -it -u root {image name or id} bash
-- to see images: docker ps