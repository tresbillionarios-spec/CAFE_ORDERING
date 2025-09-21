# GitHub Secrets Setup Guide

## 🔑 Setting up GitHub Secrets for CI/CD

### Step 1: Get Your SSH Key

First, you need to get the content of your AWS Lightsail SSH key:

```bash
# On your local machine, navigate to where your SSH key is stored
# Usually in ~/.ssh/ or your Downloads folder

# Find your Lightsail key
ls -la ~/.ssh/ | grep -i lightsail
# or
ls -la ~/Downloads/ | grep -i lightsail

# Copy the content of your key
cat ~/.ssh/LightsailDefaultKey-ap-south-1.pem
# or
cat ~/Downloads/LightsailDefaultKey-ap-south-1.pem
```

### Step 2: Add SSH Key to GitHub Secrets

1. **Go to your GitHub repository**
2. **Navigate to Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"**
4. **Add the following secret:**

   **Name:** `AWS_SSH_KEY`
   
   **Value:** Copy the entire content of your SSH key file (including the `-----BEGIN` and `-----END` lines)

### Step 3: Verify Repository URL

Make sure your GitHub Actions workflow has the correct repository URL. Update this line in `.github/workflows/deploy.yml`:

```yaml
# Line 2 in the workflow file
# Make sure this matches your actual repository URL
```

### Step 4: Test the Setup

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add CI/CD pipeline for AWS Lightsail"
   git push origin main
   ```

2. **Check GitHub Actions:**
   - Go to your repository on GitHub
   - Click on the "Actions" tab
   - You should see the deployment workflow running

3. **Monitor the deployment:**
   - Click on the running workflow
   - Check the logs for any errors
   - The deployment should complete successfully

### Step 5: Verify Deployment

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

- [ ] SSH key added to GitHub Secrets
- [ ] Repository URL is correct in workflow
- [ ] Code pushed to main branch
- [ ] GitHub Actions workflow runs successfully
- [ ] Application is accessible at https://orderkaro.co.in
- [ ] Health check endpoint responds correctly
- [ ] PM2 is running the application
- [ ] SSL certificate is working
- [ ] Nginx is proxying correctly

## 🎉 You're Ready!

Once all the above steps are completed, your CI/CD pipeline is fully functional. Every time you push to the `main` branch, your application will automatically deploy to AWS Lightsail!
