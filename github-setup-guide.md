# GitHub Setup Guide for CI/CD Deployment

## 🔑 Complete GitHub Repository Setup

### Step 1: Create GitHub Repository

1. **Go to GitHub** and create a new repository
2. **Name it:** `qr-scanner-trios` (or your preferred name)
3. **Make it private** (recommended for production)
4. **Initialize with README** (optional)

### Step 2: Push Your Code to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: QR Scanner Trios application"

# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/your-username/qr-scanner-trios.git

# Push to main branch
git push -u origin main
```

### Step 3: Add SSH Key to GitHub Secrets

1. **Go to your repository** on GitHub
2. **Click on "Settings"** tab
3. **Navigate to "Secrets and variables"** → **"Actions"**
4. **Click "New repository secret"**
5. **Add the following secret:**

   **Name:** `AWS_SSH_KEY`
   
   **Value:** Copy the entire content of your `LightsailDefaultKey-ap-south-1.pem` file
   
   ```bash
   # To get your SSH key content:
   cat ~/.ssh/LightsailDefaultKey-ap-south-1.pem
   # or
   cat ~/Downloads/LightsailDefaultKey-ap-south-1.pem
   ```

### Step 4: Verify GitHub Actions Workflow

The workflow file `.github/workflows/deploy.yml` should already be in your repository. If not, create it:

```yaml
name: Deploy to AWS Lightsail

on:
  push:
    branches: [ main ]
  workflow_dispatch: # Allow manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies and run tests
      run: |
        cd backend
        npm ci
        # Add your tests here if you have them
        # npm test
        
    - name: Deploy to AWS Lightsail
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: 13.232.219.159
        username: ubuntu
        key: ${{ secrets.AWS_SSH_KEY }}
        script: |
          # Navigate to application directory
          cd /home/ubuntu/CAFE_Ordering
          
          # Pull latest changes
          git pull origin main
          
          # Install/update dependencies
          cd backend
          npm install --production
          
          # Restart the application with PM2
          pm2 restart cafe-backend
          
          # Wait a moment for the app to start
          sleep 5
          
          # Health check
          curl -f http://localhost:5001/health || exit 1
          
          echo "✅ Deployment completed successfully!"
          
    - name: Notify deployment status
      if: always()
      run: |
        if [ "${{ job.status }}" == "success" ]; then
          echo "🎉 Deployment to orderkaro.co.in completed successfully!"
        else
          echo "❌ Deployment failed. Check the logs above."
        fi
```

### Step 5: Test the CI/CD Pipeline

1. **Make a small change** to your code
2. **Commit and push** to trigger deployment:
   ```bash
   git add .
   git commit -m "Test CI/CD deployment"
   git push origin main
   ```
3. **Check GitHub Actions** tab in your repository
4. **Monitor the deployment** process

### Step 6: Verify Deployment

After the GitHub Actions completes:

1. **Check your application:**
   ```bash
   curl https://orderkaro.co.in/health
   ```

2. **Check PM2 status on server:**
   ```bash
   ssh -i your-key.pem ubuntu@13.232.219.159
   pm2 status
   ```

3. **Check application logs:**
   ```bash
   pm2 logs cafe-backend
   ```

## 🚨 Troubleshooting

### Common Issues:

1. **SSH Key Issues:**
   - Make sure the key is copied completely (including headers)
   - Check that the key has the correct permissions
   - Verify the key is the one associated with your Lightsail instance

2. **Permission Issues:**
   - Make sure the ubuntu user has access to the application directory
   - Check that PM2 is running as the ubuntu user

3. **Network Issues:**
   - Verify that your Lightsail instance is accessible
   - Check that the security groups allow SSH access
   - Ensure the domain DNS is pointing to the correct IP

4. **Application Issues:**
   - Check that the application starts correctly
   - Verify that all dependencies are installed
   - Check the application logs for errors

### Debug Commands:

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs cafe-backend --lines 50

# Check Nginx status
sudo systemctl status nginx

# Check if ports are open
sudo netstat -tlnp | grep :5001
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Test health endpoint
curl -f http://localhost:5001/health

# Test domain
curl -f https://orderkaro.co.in/health
```

## ✅ Success Checklist

- [ ] GitHub repository created
- [ ] Code pushed to main branch
- [ ] SSH key added to GitHub Secrets
- [ ] GitHub Actions workflow file exists
- [ ] First deployment triggered successfully
- [ ] Application accessible at https://orderkaro.co.in
- [ ] Health check endpoint responds correctly
- [ ] PM2 is running the application
- [ ] SSL certificate is working
- [ ] Nginx is proxying correctly

## 🎉 You're Ready!

Once all the above steps are completed, your CI/CD pipeline is fully functional. Every time you push to the `main` branch, your application will automatically deploy to AWS Lightsail!

### 🚀 How It Works:

1. **Push to main branch** → GitHub Actions triggers
2. **SSH into server** → Using your SSH key
3. **Pull latest code** → `git pull origin main`
4. **Install dependencies** → `npm install --production`
5. **Reload PM2 app** → `pm2 reload cafe-backend` (zero downtime)
6. **Health check** → Verify application is running
7. **Deployment complete** → Success notification

Your application is now fully automated! 🎉
