# Stage 1: Build the React application

# Use a node base image for building the React app
FROM node:20.9.0 as react-build

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) files
COPY package*.json /app/

# Install dependencies for the entire project
RUN npm install

# Copy the entire project source code into the container
COPY . /app/

# Build the React app (assuming it's in a directory named 'client')
RUN npm run build --prefix client

# Stage 2: Setup the Node.js/Express server to serve the React app

# Use a node base image for the server
FROM node:20.9.0 as node-server

# Set the working directory for the Node.js app
WORKDIR /node

# Copy package.json, package-lock.json and node_modules from the build stage
COPY --from=react-build /app/package*.json /node/
COPY --from=react-build /app/node_modules /node/node_modules

# Copy the built React app from the first stage
COPY --from=react-build /app/client/build /node/public

# Copy the Node.js/Express app source code into the container
COPY . /node/

# Expose the port the Node.js app will run on
EXPOSE 5000 3000

# Define the command to run the Node.js/Express server
CMD ["npm", "run", "dev"]