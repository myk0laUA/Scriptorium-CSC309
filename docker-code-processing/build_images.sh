#!/bin/bash

# Define the languages and their respective image names
declare -A IMAGES=(
  ["python"]="python-runner"
  ["javascript"]="node-runner"
  ["java"]="java-runner"
  ["csharp"]="csharp-runner"
  ["cpp"]="cpp-runner"
  ["php"]="php-runner"
  ["ruby"]="ruby-runner"
  ["go"]="go-runner"
  ["swift"]="swift-runner"
  ["r"]="r-runner"
)

# Loop through the languages and build each Docker image
for language in "${!IMAGES[@]}"; do
  echo "Building Docker image for $language..."
  docker build -t "${IMAGES[$language]}" -f "$language/Dockerfile" "$language" || {
    echo "Failed to build image for $language"
    exit 1
  }
  echo "Successfully built ${IMAGES[$language]}"
done

echo "All images built successfully!"
