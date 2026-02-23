FROM python:3.9-slim

WORKDIR /app

# Copy application files
COPY investor-intro-links.html .
COPY server.py .

# Make server executable
RUN chmod +x server.py

# Expose port
EXPOSE 8080

# Run server
CMD ["python3", "server.py"]
