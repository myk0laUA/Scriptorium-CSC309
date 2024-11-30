# Use the official Go image.
FROM golang:1.17-alpine

# Set the working directory.
WORKDIR /app

# Copy the current directory contents into the container at /app.
COPY . /app

# Define the command to run your application.
ENTRYPOINT ["go", "run", "code.go"]
