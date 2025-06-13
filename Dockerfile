# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install all dependencies including dev
RUN npm install

# Copy all source files
COPY . .

# Run Vite build to generate dist/
RUN npm run build

# Install only production dependencies
RUN npm prune --omit=dev

# Expose port for Express server
EXPOSE 3000

# Start the Express server
CMD ["node", "server.js"]
