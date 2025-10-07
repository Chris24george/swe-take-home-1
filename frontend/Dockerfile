FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 3000

# Run dev server with host flag to allow external connections
CMD ["npm", "run", "dev", "--", "--host"]

