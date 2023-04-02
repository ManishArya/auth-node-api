FROM node:lts-alpine AS build
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --only=production
COPY . .

FROM node:lts-alpine AS Stage2
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install -g typescript && npm install --save-dev
COPY . .
RUN tsc

FROM  node:lts-alpine
WORKDIR /app
COPY . .
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=Stage2 /app/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
