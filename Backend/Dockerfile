FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install build dependencies if needed
RUN apk add --no-cache curl

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose API port
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

# Start production server
CMD ["node", "src/server.js"]
