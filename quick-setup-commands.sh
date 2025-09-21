#!/bin/bash

# Quick Setup Commands for AWS Lightsail
# Run these commands on your AWS Lightsail instance

echo "🚀 Quick Setup Commands for AWS Lightsail"
echo "=========================================="
echo ""

echo "1. Update system and install dependencies:"
echo "sudo apt update && sudo apt upgrade -y"
echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
echo "sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx ufw"
echo "sudo npm install -g pm2"
echo ""

echo "2. Setup application directory:"
echo "mkdir -p /home/ubuntu/CAFE_Ordering"
echo "cd /home/ubuntu/CAFE_Ordering"
echo "# Clone your repository here"
echo "git clone https://github.com/your-username/your-repo-name.git ."
echo "cd backend && npm install --production"
echo ""

echo "3. Setup PM2:"
echo "cd /home/ubuntu/CAFE_Ordering/backend"
echo "pm2 start src/server.js --name cafe-backend"
echo "pm2 save"
echo "pm2 startup"
echo "# Follow the PM2 startup instructions"
echo ""

echo "4. Setup Nginx:"
echo "sudo tee /etc/nginx/sites-available/orderkaro.co.in << 'EOF'"
echo "# [Nginx configuration will be here]"
echo "EOF"
echo "sudo ln -s /etc/nginx/sites-available/orderkaro.co.in /etc/nginx/sites-enabled/"
echo "sudo rm -f /etc/nginx/sites-enabled/default"
echo "sudo nginx -t"
echo "sudo systemctl restart nginx"
echo ""

echo "5. Setup SSL:"
echo "sudo certbot --nginx -d orderkaro.co.in -d www.orderkaro.co.in"
echo ""

echo "6. Setup firewall:"
echo "sudo ufw allow 22/tcp"
echo "sudo ufw allow 80/tcp"
echo "sudo ufw allow 443/tcp"
echo "sudo ufw --force enable"
echo ""

echo "7. Copy deployment script:"
echo "# Copy the deploy.sh content to /home/ubuntu/deploy.sh"
echo "chmod +x /home/ubuntu/deploy.sh"
echo ""

echo "8. Test the setup:"
echo "pm2 status"
echo "curl http://localhost:5001/health"
echo "curl https://orderkaro.co.in/health"
echo ""

echo "✅ Setup completed! Your application is ready for CI/CD deployment!"
