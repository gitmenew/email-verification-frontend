# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with static server (or nginx, or your own Express server)
FROM node:18
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY server.js .          # if using Express for static serving
COPY package.json .       # for express dependencies
RUN npm install           # if you need express

EXPOSE 80
CMD ["node", "server.js"]
