# Stage 1: Build the application
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY tsconfig.json ./
COPY src ./src/
RUN npx prisma generate
RUN npm run build

# Stage 2: Production runtime image
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Sao chép Prisma Client đã được generate ở Stage 1 để tránh việc npx tải phiên bản Prisma 7 mới nhất bị lỗi tương thích
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client

COPY --from=build /app/dist ./dist

EXPOSE 8085
CMD ["node", "dist/index.js"]
