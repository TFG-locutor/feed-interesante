FROM node:12 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "buildlist"]

FROM node:12-alpine
WORKDIR /app
ENTRYPOINT [ "node", "main.js" ]
COPY --from=builder /app/dist/* ./

