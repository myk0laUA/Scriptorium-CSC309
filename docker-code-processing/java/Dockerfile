# Use the official OpenJDK image.
FROM openjdk:17-alpine

# Set the working directory.
WORKDIR /app

# Define the command to dynamically compile and run the Java application.
ENTRYPOINT ["sh", "-c", "javac Main.java && java Main"]
