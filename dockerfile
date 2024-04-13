FROM node:alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/icons /app/icons
COPY --from=builder /app/images /app/images
COPY --from=builder /app/music /app/music
COPY --from=builder /app/fonts /app/fonts
COPY --from=builder /app/index.js /app/index.js
EXPOSE 5000
CMD ["node", "index.js"]