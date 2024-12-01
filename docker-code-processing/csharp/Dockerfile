# Use the .NET 8.0 SDK image
FROM mcr.microsoft.com/dotnet/sdk:8.0

# Set the working directory
WORKDIR /app


# Install the dotnet-script tool
RUN dotnet tool install -g dotnet-script

# Add dotnet tools to the PATH
ENV PATH="$PATH:/root/.dotnet/tools"

# Define the command to run your application
ENTRYPOINT ["dotnet-script", "code.cs"]
