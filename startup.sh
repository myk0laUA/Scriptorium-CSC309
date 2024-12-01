#!/bin/bash

# Ensure the script is executed with Bash
if [ -z "$BASH_VERSION" ]; then
  echo "Please run this script with bash"
  exit 1
fi

# Check for required compilers/interpreters
required_commands=("node" "npm" "gcc" "g++" "javac" "python3" "docker")
for command in "${required_commands[@]}"; do
  if ! command -v $command &> /dev/null; then
    echo "$command could not be found. Please install $command."
    exit 1
  fi
done

echo "All required commands are available."

# Install required Node.js packages
echo "Installing required Node.js packages..."
npm install

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Create an admin user
echo "Creating an admin user..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

(async () => {
    const username = 'admin';
    const password = 'adminpassword';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                username,
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@uoft.com',
                password: hashedPassword,
                phoneNum: '0987654321',
                role: 'ADMIN',
            }
        });
        console.log('Admin user created with username: admin and password: adminpassword');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
})();
"

echo "Admin user setup complete."

# Build Docker images for each language
echo "Building Docker images for supported languages..."

# List of supported languages
languages=("cpp" "csharp" "go" "java" "javascript" "php" "python" "r" "ruby" "swift")

for language in "${languages[@]}"; do
  image_name="${language}-runner"
  dockerfile_path="./docker-code-processing/${language}/Dockerfile"

  # Check if the Dockerfile exists
  if [ ! -f "$dockerfile_path" ]; then
    echo "Dockerfile for $language not found at $dockerfile_path. Skipping..."
    continue
  fi

  echo "Building Docker image for $language..."

  docker build -t "$image_name" -f "$dockerfile_path" "./dockerfiles/${language}" || {
    echo "Failed to build Docker image for $language."
    exit 1
  }

  echo "Successfully built Docker image: $image_name"
done

echo "All Docker images built successfully."

echo "Setup complete."
