
# Step 1: Build Vue frontend
FROM node:18 AS builder
WORKDIR /app
COPY client ./client
WORKDIR /app/client
RUN npm install && npm run build

# Step 2: Setup backend with built frontend
FROM node:18
WORKDIR /app

COPY server ./server
COPY --from=builder /app/client/dist ./public

WORKDIR /app/server
RUN npm install

EXPOSE 3000
CMD ["node", "server.js"]
