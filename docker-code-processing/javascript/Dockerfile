# Use the official Node.js image.
FROM node:16-alpine

# Set the working directory.
WORKDIR /app

# Copy the current directory contents into the container at /app.
COPY . /app

# Install any dependencies if needed (e.g., for npm packages).
# RUN npm install

# Define the command to run your application.
ENTRYPOINT ["node", "code.js"]
