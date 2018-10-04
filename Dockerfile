FROM node:8

COPY sdk-18c /opt/sdk-18c
WORKDIR /opt/sdk-18c

RUN npm install -g
RUN npm link
#CMD ["/bin/bash"]