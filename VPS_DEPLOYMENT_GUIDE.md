# VPS Deployment Guide for Book Inventory Frontend

This guide provides the configuration steps for deploying your Vite React application to a VPS server using Nginx as a reverse proxy for the domain `book-inventory.mindkeeper.my.id`.

## Prerequisites

- ✅ VPS server with Ubuntu 20.04+ 
- ✅ Domain `book-inventory.mindkeeper.my.id` pointing to your VPS IP
- ✅ SSH access to your VPS
- ✅ Project cloned to `/home/book-inventories-fe`
- ✅ Nginx installed
- ✅ Certbot installed  
- ✅ Node.js and npm installed
- ✅ PM2 installed

## Table of Contents

1. [Project Setup and Build](#project-setup-and-build)
2. [Nginx Configuration](#nginx-configuration)
3. [SSL Certificate Setup](#ssl-certificate-setup)
4. [PM2 Process Management](#pm2-process-management)
5. [Security Configuration](#security-configuration)
6. [Deployment Script](#deployment-script)
7. [Troubleshooting](#troubleshooting)

## Project Setup and Build

### 1. Navigate to Your Project Directory

```bash
cd /home/book-inventories-fe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build for Production

```bash
npm run build
```

This will create a `dist` folder with your production-ready files.

### 4. Verify Build

```bash
ls -la dist/
```

You should see files like `index.html`, `assets/` folder, etc.

### 5. Set Proper Permissions

```bash
chown -R www-data:www-data /home/book-inventories-fe/dist
chmod -R 755 /home/book-inventories-fe/dist
```

## Nginx Configuration

### 1. Create Nginx Site Configuration

```bash
nano /etc/nginx/sites-available/book-inventory
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name book-inventory.mindkeeper.my.id;

    root /home/book-inventories-fe/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Hide Nginx version
    server_tokens off;
}
```

### 2. Enable the Site

```bash
ln -s /etc/nginx/sites-available/book-inventory /etc/nginx/sites-enabled/
```

### 3. Remove Default Site (if exists)

```bash
rm /etc/nginx/sites-enabled/default
```

### 4. Test Nginx Configuration

```bash
nginx -t
```

### 5. Reload Nginx

```bash
systemctl reload nginx
```

## SSL Certificate Setup

### 1. Obtain SSL Certificate

```bash
certbot --nginx -d book-inventory.mindkeeper.my.id
```

Follow the prompts to:
- Enter your email address
- Agree to terms of service
- Choose whether to share email with EFF
- Select redirect option (recommended: redirect HTTP to HTTPS)

### 2. Verify Auto-Renewal

```bash
certbot renew --dry-run
```

### 3. Final Nginx Configuration (after SSL)

Your Nginx config will be automatically updated, but here's what it should look like:

```nginx
server {
    listen 80;
    server_name book-inventory.mindkeeper.my.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name book-inventory.mindkeeper.my.id;

    ssl_certificate /etc/letsencrypt/live/book-inventory.mindkeeper.my.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/book-inventory.mindkeeper.my.id/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /home/book-inventories-fe/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Hide Nginx version
    server_tokens off;
}
```

## PM2 Process Management

### 1. Create a Simple Server Script (Optional)

If you want to serve your app through a Node.js server instead of static files:

```bash
nano /home/book-inventories-fe/server.js
```

```javascript
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### 2. Install Express (if using the server script)

```bash
cd /home/book-inventories-fe
npm install express
```

### 3. Start with PM2 (if using server script)

```bash
cd /home/book-inventories-fe
pm2 start server.js --name "book-inventory"
pm2 startup
pm2 save
```

### 4. Update Nginx for PM2 (if using server script)

If you choose to use PM2, update your Nginx configuration to proxy to the Node.js server:

```nginx
server {
    listen 443 ssl http2;
    server_name book-inventory.mindkeeper.my.id;

    ssl_certificate /etc/letsencrypt/live/book-inventory.mindkeeper.my.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/book-inventory.mindkeeper.my.id/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Hide Nginx version
    server_tokens off;
}
```

## Security Configuration

### 1. Configure Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### 2. Secure SSH (Optional but Recommended)

```bash
nano /etc/ssh/sshd_config
```

Make these changes:
- `PermitRootLogin yes` (since you're using root)
- `PasswordAuthentication no` (if using SSH keys)
- `Port 2222` (change default port)

```bash
systemctl restart ssh
```

### 3. Install Fail2Ban

```bash
apt install fail2ban -y
systemctl start fail2ban
systemctl enable fail2ban
```

## Deployment Script

Create a deployment script for easy updates:

```bash
nano /home/book-inventories-fe/deploy.sh
```

```bash
#!/bin/bash

echo "Starting deployment..."

# Navigate to project directory
cd /home/book-inventories-fe

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build the application
npm run build

# Set proper permissions
chown -R www-data:www-data /home/book-inventories-fe/dist
chmod -R 755 /home/book-inventories-fe/dist

# Reload Nginx
systemctl reload nginx

# If using PM2, restart the process
# pm2 restart book-inventory

echo "Deployment completed!"
```

Make it executable:

```bash
chmod +x /home/book-inventories-fe/deploy.sh
```

### Usage

To deploy updates:

```bash
cd /home/book-inventories-fe
./deploy.sh
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Nginx Configuration Test Fails

```bash
nginx -t
# Check the error message and fix syntax issues
```

#### 2. SSL Certificate Issues

```bash
# Check certificate status
certbot certificates

# Renew certificate manually
certbot renew
```

#### 3. Permission Issues

```bash
# Fix ownership
chown -R www-data:www-data /home/book-inventories-fe/dist

# Fix permissions
chmod -R 755 /home/book-inventories-fe/dist
```

#### 4. Check Nginx Logs

```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

#### 5. Check System Resources

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop
```

### Useful Commands

```bash
# Restart Nginx
systemctl restart nginx

# Check Nginx status
systemctl status nginx

# Test Nginx configuration
nginx -t

# Reload Nginx configuration
systemctl reload nginx

# Check SSL certificate expiry
certbot certificates

# View PM2 processes (if using)
pm2 list
pm2 logs
pm2 restart book-inventory
```

## Monitoring and Maintenance

### 1. Set up Log Rotation

Nginx logs are automatically rotated, but you can check:

```bash
sudo nano /etc/logrotate.d/nginx
```

### 2. Monitor Disk Space

```bash
# Add to crontab for daily monitoring
crontab -e

# Add this line to check disk space daily
0 9 * * * df -h | mail -s "Daily Disk Usage Report" your-email@example.com
```

### 2. Backup Strategy

```bash
# Create backup script
nano /home/book-inventories-fe/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /home/backups/book-inventory_$DATE.tar.gz /home/book-inventories-fe
find /home/backups -name "book-inventory_*.tar.gz" -mtime +7 -delete
```

Make it executable:

```bash
chmod +x /home/book-inventories-fe/backup.sh
```

## Conclusion

Your Vite React application should now be successfully deployed and accessible at `https://book-inventory.mindkeeper.my.id`. The setup includes:

- ✅ Production-ready build served by Nginx
- ✅ SSL certificate with automatic renewal
- ✅ Security headers and configurations
- ✅ Gzip compression for better performance
- ✅ Client-side routing support
- ✅ Static asset caching

Remember to:
- Regularly update your server packages
- Monitor SSL certificate renewal
- Keep your application dependencies updated
- Monitor server resources and logs

For any issues, refer to the troubleshooting section or check the respective service logs.