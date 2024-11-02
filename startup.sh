#!/bin/bash

# Logic influenced by ChatGPT
# Check for required compilers/interpreters
required_commands=("node" "npm" "gcc" "g++" "javac" "python3")
for command in "${required_commands[@]}"; do
  if ! command -v $command &> /dev/null; then
    echo "$command could not be found. Please install $command."
    exit 1
  fi
done

# Install required packages
echo "Installing required packages..."
npm install

# Run migrations
echo "Running migrations..."
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
})();
"

echo "Setup complete."