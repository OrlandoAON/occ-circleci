# occ-docker-jenkins
Testing integration between OCC and Jenkins usind Docker.

# creating our image:

docker image build --tag occ-docker-jenkins:latest .

docker run -it --rm occ-docker-jenkins:latest bash (to check if everything is ok)

docker run -p 8080:8080 -p 50000:50000 -v /var/run/docker.sock:/var/run/docker.sock --privileged jenkins/jenkins:lts

docker run -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock --privileged docker


docker exec -it -u root {image name or id} bash
-- to see images: docker ps

docker exec -it a17 bash #run into a existing container


docker run -v /var/run/docker.sock:/var/run/docker.sock --privileged jenkins/jenkins:lts

docker run -v /usr/local/bin/docker:/usr/local/bin/docker -v /var/run/docker.sock:/var/run/docker.sock --privileged jenkins/jenkins:lts


after install jenkins, REMEMBER to install docker plugin!!! to avoid docker error in build tests: docker not found.