# Base image using Python
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYECODE=1
# Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip 

# Install necessary system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Copy the dependencies file and install packages
COPY requirements.txt .
RUN pip --no-cache-dir install -r requirements.txt

# Copy application files
COPY . .

# Expose ports
EXPOSE 8000 8001

# Run migrations and start both Daphne and Gunicorn using sh
CMD [ "daphne", "-b", "0.0.0.0", "-p", "8000", "skillbridge.asgi:application" ]
