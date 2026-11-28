# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production || npm run build
RUN node -e "const fs=require('fs'),p='/app/dist/sisa-frontend',v=String(Date.now()),idx=p+'/index.html'; let h=fs.readFileSync(idx,'utf8'); h=h.replace(/assets\/app-controller\.js(\?v=[^\"']*)?/g,'assets/app-controller.js?v='+v); h=h.replace('</head>','<script>window.__SISA_APP_VERSION__=\"'+v+'\";</script></head>'); fs.writeFileSync(idx,h); const meta=JSON.stringify({version:v,builtAt:new Date().toISOString()}); fs.writeFileSync(p+'/version.json',meta); fs.writeFileSync(p+'/assets/version.json',meta);"

# Runtime Stage
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/sisa-frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
