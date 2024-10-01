# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Build the frontend for production
RUN npm run build

# Expose port 3000 
EXPOSE 3000

# Start the frontend (serve build files)
CMD ["npm", "run", "preview"]
