FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY schema.prisma ./

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate --schema=./schema.prisma

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose the port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]