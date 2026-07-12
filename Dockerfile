# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies for building
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client and build the application
RUN npx prisma generate
RUN npm run build

# Production Stage
FROM node:22-alpine

WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built application and public assets from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start:prod"]
