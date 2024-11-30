# Use the official lightweight Python image.
FROM python:3.10-alpine

# Set the working directory in the container to /app.
WORKDIR /app

# Copy the current directory contents into the container at /app.
COPY . /app

# Install any needed packages specified in requirements.txt (if any).
# RUN pip install --no-cache-dir -r requirements.txt

# Run code.py when the container launches.
ENTRYPOINT ["python", "code.py"]
