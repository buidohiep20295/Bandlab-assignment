FROM node:14

WORKDIR /usr/src/app

COPY package.json ./

# Install dependencies
RUN npm install

RUN npm install -g nodemon

# Copy the rest of the application code
COPY . .

# Command to run the application
CMD ["npm", "run", "dev"]