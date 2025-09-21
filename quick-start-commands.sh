#!/bin/bash

# Quick Start Commands for Complete Setup
# Run these commands to set up everything from Git to AWS

echo "🚀 QR Scanner Trios - Quick Start Commands"
echo "=========================================="
echo ""

echo "📋 STEP-BY-STEP SETUP COMMANDS:"
echo ""

echo "1. 🖥️  SERVER SETUP (Run on AWS Lightsail):"
echo "   ssh -i LightsailDefaultKey-ap-south-1.pem ubuntu@13.232.219.159"
echo "   wget https://raw.githubusercontent.com/your-username/your-repo-name/main/complete-setup.sh"
echo "   chmod +x complete-setup.sh"
echo "   ./complete-setup.sh"
echo ""

echo "2. 📁 GITHUB REPOSITORY SETUP:"
echo "   # Create new repository on GitHub"
echo "   # Name: qr-scanner-trios"
echo "   # Make it private (recommended)"
echo ""

echo "3. 🔑 ADD SSH KEY TO GITHUB SECRETS:"
echo "   # Go to repository → Settings → Secrets and variables → Actions"
echo "   # Add new secret:"
echo "   # Name: AWS_SSH_KEY"
echo "   # Value: Copy content of LightsailDefaultKey-ap-south-1.pem"
echo ""

echo "4. 📤 PUSH CODE TO GITHUB:"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit: QR Scanner Trios'"
echo "   git remote add origin https://github.com/your-username/qr-scanner-trios.git"
echo "   git push -u origin main"
echo ""

echo "5. 🚀 TRIGGER FIRST DEPLOYMENT:"
echo "   # Make a small change to your code"
echo "   git add ."
echo "   git commit -m 'Test CI/CD deployment'"
echo "   git push origin main"
echo ""

echo "6. ✅ VERIFY DEPLOYMENT:"
echo "   # Check GitHub Actions tab in your repository"
echo "   # Monitor the deployment process"
echo "   # Test your application at https://orderkaro.co.in"
echo ""

echo "🎯 WHAT YOU GET:"
echo "   ✅ Automatic deployment on every push to main"
echo "   ✅ Zero-downtime deployments with PM2"
echo "   ✅ SSL certificate with Let's Encrypt"
echo "   ✅ Health monitoring and automatic rollback"
echo "   ✅ Daily automated backups"
echo "   ✅ Security hardening with firewall"
echo "   ✅ Process management with PM2"
echo "   ✅ Reverse proxy with Nginx"
echo ""

echo "🔧 USEFUL COMMANDS:"
echo "   # Check PM2 status: pm2 status"
echo "   # View logs: pm2 logs cafe-backend"
echo "   # Restart app: pm2 restart cafe-backend"
echo "   # Manual deploy: /home/ubuntu/deploy.sh"
echo "   # Create backup: /home/ubuntu/backup.sh"
echo ""

echo "🚨 TROUBLESHOOTING:"
echo "   # Check deployment status: pm2 status"
echo "   # Check health: curl https://orderkaro.co.in/health"
echo "   # Check logs: pm2 logs cafe-backend --lines 50"
echo "   # Check Nginx: sudo systemctl status nginx"
echo ""

echo "📞 SUPPORT:"
echo "   # If you encounter issues, check the logs above"
echo "   # Verify all steps are completed correctly"
echo "   # Test each component individually"
echo ""

echo "🎉 READY TO DEPLOY!"
echo "   Your application will automatically deploy to AWS Lightsail"
echo "   every time you push code to the main branch!"
echo ""
