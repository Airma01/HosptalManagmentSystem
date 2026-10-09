# Build stage
FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Allow API base URL to be set at build time (Vite embeds it)
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Optional: custom nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]