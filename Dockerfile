# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy only necessary files
COPY . .

# Install only production dependencies
RUN npm install --omit=dev

# Expose the app port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
