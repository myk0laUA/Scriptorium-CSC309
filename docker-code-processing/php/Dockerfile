# Use the official PHP CLI image.
FROM php:8.0-cli-alpine

# Set the working directory.
WORKDIR /app

# Copy the current directory contents into the container at /app.
COPY . /app

# Define the command to run your application.
ENTRYPOINT ["php", "code.php"]
