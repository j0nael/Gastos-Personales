# Usamos Nginx para servir archivos estáticos
FROM nginx:alpine

# Copiar archivos al directorio público de Nginx
COPY . /usr/share/nginx/html

# Exponer puerto 3000
EXPOSE 3000

# Ejecutar Nginx en puerto 3000
RUN sed -i 's/listen       80;/listen 3000;/g' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]