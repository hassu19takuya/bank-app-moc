# Use official Python runtime
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Cloud Run uses PORT environment variable
ENV PORT=8080

# Run the application
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT}
