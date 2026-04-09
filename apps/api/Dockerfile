FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN npm ci --workspace=@filevault/api --workspace=@filevault/shared
COPY packages/shared packages/shared
RUN npm run build --workspace=@filevault/shared
COPY apps/api apps/api
RUN npm run build --workspace=@filevault/api

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/apps/api/package.json apps/api/
COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/shared/package.json packages/shared/
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "apps/api/dist/main.js"]
