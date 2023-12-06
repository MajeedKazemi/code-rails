# Base image
FROM node:21-slim

# Python installation for pylsp
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Install pm2 globally
RUN npm install pm2 -g

# Create a virtual environment and install pylsp
RUN python3 -m venv /usr/src/app/venv
RUN /usr/src/app/venv/bin/pip install "python-lsp-server[all]"

# Set PYLSP_PATH environment variable to point to the virtual environment's pylsp
ENV PYLSP_PATH=/usr/src/app/venv/bin/pylsp

# Build the app
COPY . .
RUN npx tsc

# Expose port (the port your app runs on)
EXPOSE 3001

# Start the server with pm2
CMD ["node", "dist/server.js"]
