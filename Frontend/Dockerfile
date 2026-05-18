# Use the official Flutter image from Cirrus Labs
FROM ghcr.io/cirruslabs/flutter:stable

# Set the working directory
WORKDIR /app

# Run as root to ensure we can install dependencies if needed
USER root

# Enable web support
RUN flutter config --enable-web

# Copy pubspec.yaml
COPY pubspec.yaml ./

# Download dependencies
RUN flutter pub get

# Copy the rest of the application code
COPY . .

# Expose port 8081
EXPOSE 8081

# Run the flutter web server
# --web-hostname 0.0.0.0 allows connections from outside the container
# --web-port 8081 matches the exposed port
CMD ["flutter", "run", "-d", "web-server", "--web-hostname", "0.0.0.0", "--web-port", "8081"]
