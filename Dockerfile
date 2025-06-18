# Use Node.js LTS as the base image
FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl

# Install pnpm
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install

# Copy source code
COPY . .

# Build TypeScript code
RUN pnpm build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["pnpm", "start"]
