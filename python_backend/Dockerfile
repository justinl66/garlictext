# Use an official Python slim image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy dependency file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the Flask default port
EXPOSE 8000

# Run the Flask application
CMD ["python", "app.py"]
