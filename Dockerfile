# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Create a directory for OpenAPI files
RUN mkdir -p /app/specs

# Expose default port
EXPOSE 3000

# Set entrypoint to the CLI tool
ENTRYPOINT ["node", "dist/index.js"]

# Default command (can be overridden)
CMD ["start", "/app/specs/openapi.yaml", "-p", "3000"]
