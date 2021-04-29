FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# commands.sh
COPY commands.sh /commands.sh 
RUN chmod +x /commands.sh

# wait-for-it.sh
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN useradd appuser && chown -R appuser /usr/src/app
USER appuser

EXPOSE 3000
ENTRYPOINT [ "/bin/bash", "-c" ]
CMD [ "/commands.sh" ]