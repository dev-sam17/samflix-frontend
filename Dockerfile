# Use Node.js LTS as the base image
FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN pnpm prisma:generate

# Copy source code
COPY . .

# Build TypeScript code
RUN pnpm build

# Create media directories with appropriate permissions
# RUN mkdir -p /media/movies /media/tv
# RUN chown -R node:node /media /app

# Switch to non-root user
# USER node

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["pnpm", "start"]
