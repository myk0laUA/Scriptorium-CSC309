# Use the official Ruby image
FROM ruby:3.0-alpine

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app.
COPY . /app

# Define the command to run your application
ENTRYPOINT ["ruby", "/app/code.rb"]
