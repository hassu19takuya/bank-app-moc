# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Debug npm config
RUN npm config list
# Force fresh install ignoring local lockfile issues
RUN rm -f package-lock.json
RUN npm install --registry=https://registry.npmjs.org --verbose

# Copy source code
COPY . .

# Build the app with production backend URL (from .env.production)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run uses PORT environment variable
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
