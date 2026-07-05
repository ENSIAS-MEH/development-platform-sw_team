FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
# Force Next.js à écouter sur toutes les interfaces réseau
CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]