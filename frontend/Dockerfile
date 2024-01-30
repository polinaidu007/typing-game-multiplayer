# Use an official Node.js runtime as a parent image
FROM node:14-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the application code to the container
COPY . .

# Build the app
RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "start"]