# CI/CD Pipeline Explanation for QR Scanner Trios

## 🏗️ Pipeline Architecture Overview

The GitHub Actions CI/CD pipeline is designed to automatically build, test, and deploy your QR Scanner Trios application to AWS Lightsail Container Services with the following architecture:

```
GitHub Repository
       ↓
   GitHub Actions
       ↓
   AWS ECR (Container Registry)
       ↓
   AWS Lightsail Container Services
       ↓
   Load Balancer + SSL
       ↓
   Custom Domains
```

## 🔄 Pipeline Workflow Breakdown

### 1. **Trigger Events**
- **Push to main**: Triggers full deployment
- **Pull Request**: Triggers build and test (no deployment)

### 2. **Matrix Strategy**
The pipeline uses a **job matrix** to build and deploy both frontend and backend in parallel:

```yaml
strategy:
  matrix:
    include:
      - app: frontend
        dockerfile: frontend/Dockerfile
        context: frontend
        port: 80
        service_name: qr-scanner-frontend
        domain: orders.mycafe.com
      - app: backend
        dockerfile: backend/Dockerfile
        context: backend
        port: 5001
        service_name: qr-scanner-backend
        domain: api.mycafe.com
```

### 3. **Step-by-Step Process**

#### **Step 1: Code Checkout**
```yaml
- name: Checkout code
  uses: actions/checkout@v4
```
- Downloads the latest code from your repository

#### **Step 2: AWS Authentication**
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ env.AWS_REGION }}
```
- Configures AWS CLI with your credentials
- Uses GitHub Secrets for security

#### **Step 3: Docker Registry Login**
```yaml
- name: Login to Amazon ECR
  id: login-ecr
  uses: aws-actions/amazon-ecr-login@v2
```
- Authenticates with AWS ECR (Elastic Container Registry)
- Allows pushing Docker images

#### **Step 4: Build and Push Docker Images**
```yaml
- name: Build, tag, and push Docker image
  id: build-image
  env:
    ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
    IMAGE_TAG: ${{ github.sha }}
  run: |
    # Build Docker image
    docker build -t $ECR_REGISTRY/${{ matrix.service_name }}:$IMAGE_TAG -f ${{ matrix.dockerfile }} ${{ matrix.context }}
    
    # Tag with latest for easier reference
    docker tag $ECR_REGISTRY/${{ matrix.service_name }}:$IMAGE_TAG $ECR_REGISTRY/${{ matrix.service_name }}:latest
    
    # Push both tags
    docker push $ECR_REGISTRY/${{ matrix.service_name }}:$IMAGE_TAG
    docker push $ECR_REGISTRY/${{ matrix.service_name }}:latest
```
- Builds Docker image for each app
- Tags with Git commit SHA for versioning
- Pushes to AWS ECR registry

#### **Step 5: Deploy to Lightsail**
```yaml
- name: Deploy to Lightsail Container Service
  run: |
    aws lightsail put-container-service-deployment \
      --service-name $SERVICE_NAME \
      --public-endpoint containerName=${{ matrix.app }},containerPort=${{ matrix.port }},healthCheckPath=/health \
      --containers '{
        "'${{ matrix.app }}'": {
          "image": "'$IMAGE_URI'",
          "ports": {
            "'${{ matrix.port }}'": "HTTP"
          },
          "environment": {
            "NODE_ENV": "production",
            "PORT": "'${{ matrix.port }}'"
          }
        }
      }'
```
- Deploys new container with updated image
- Configures health checks
- Sets environment variables

#### **Step 6: SSL Certificate Management**
```yaml
- name: Configure SSL Certificate
  if: matrix.app == 'frontend'
  run: |
    # Request SSL certificate for the domain
    aws lightsail create-certificate \
      --certificate-name ${{ matrix.domain }}-cert \
      --domain-name ${{ matrix.domain }} \
      --subject-alternative-names ${{ matrix.domain }} \
      --region ${{ env.AWS_REGION }} || echo "Certificate may already exist"
    
    # Attach certificate to load balancer
    aws lightsail attach-certificate-to-distribution \
      --distribution-name ${{ env.LOAD_BALANCER_NAME }} \
      --certificate-name ${{ matrix.domain }}-cert \
      --region ${{ env.AWS_REGION }}
```
- Requests SSL certificates from AWS
- Attaches certificates to load balancer
- Only runs for frontend to avoid conflicts

#### **Step 7: Health Checks**
```yaml
- name: Health Check
  run: |
    # Get the service URL
    SERVICE_URL=$(aws lightsail get-container-service \
      --service-name ${{ matrix.service_name }} \
      --query 'containerService.url' \
      --output text \
      --region ${{ env.AWS_REGION }})
    
    # Wait for service to be healthy
    for i in {1..30}; do
      if curl -f "$SERVICE_URL/health" > /dev/null 2>&1; then
        echo "✅ ${{ matrix.app }} service is healthy"
        break
      else
        echo "⏳ Waiting for ${{ matrix.app }} service to be healthy... ($i/30)"
        sleep 10
      fi
    done
```
- Verifies deployment success
- Waits for services to be healthy
- Provides feedback on deployment status

## 🌐 Network Architecture

### **Load Balancer Configuration**
```
Internet
    ↓
Lightsail Load Balancer (SSL Termination)
    ↓
┌─────────────────┬─────────────────┐
│   Frontend      │    Backend      │
│   Port: 80      │   Port: 5001   │
│   orderkaro.co.in │ api.orderkaro.co.in │
└─────────────────┴─────────────────┘
```

### **Domain Mapping**
- **Frontend**: `https://orderkaro.co.in` → Load Balancer → Frontend Container (Port 80)
- **Backend**: `https://api.orderkaro.co.in` → Load Balancer → Backend Container (Port 5001)

### **SSL Certificate Flow**
1. **Certificate Request**: AWS Lightsail requests SSL certificate from Let's Encrypt
2. **DNS Validation**: Domain owner must add DNS records for validation
3. **Certificate Issuance**: Once validated, certificate is issued
4. **Load Balancer Attachment**: Certificate is attached to load balancer
5. **HTTPS Traffic**: All traffic is encrypted via SSL/TLS

## 🔧 Environment Variables

### **Frontend Container**
```yaml
environment:
  NODE_ENV: production
  PORT: 80
  VITE_API_URL: https://api.orderkaro.co.in/api
```

### **Backend Container**
```yaml
environment:
  NODE_ENV: production
  PORT: 5001
  DB_HOST: your-rds-endpoint
  DB_USER: your-db-user
  DB_PASS: your-db-password
  DB_NAME: qr_ordering_db
  JWT_SECRET: your-jwt-secret
  CORS_ORIGIN: https://orderkaro.co.in
```

## 🚀 Deployment Process

### **Automatic Deployment**
1. **Code Push**: Developer pushes to `main` branch
2. **Pipeline Trigger**: GitHub Actions starts automatically
3. **Parallel Build**: Frontend and backend build simultaneously
4. **Image Push**: Docker images pushed to ECR
5. **Service Update**: Lightsail services updated with new images
6. **Health Check**: Services verified as healthy
7. **SSL Update**: Certificates updated if needed

### **Rollback Process**
If deployment fails:
1. **Previous Image**: Lightsail automatically rolls back to previous working image
2. **Health Check**: Failed health checks trigger rollback
3. **Manual Rollback**: Can manually specify previous image tag

## 📊 Monitoring and Logs

### **Health Check Endpoints**
- **Frontend**: `https://orderkaro.co.in/` (React app)
- **Backend**: `https://api.orderkaro.co.in/health` (API health check)

### **Lightsail Monitoring**
- **Container Logs**: Available in Lightsail console
- **Load Balancer Metrics**: Request count, response time, error rate
- **SSL Certificate Status**: Certificate expiration and validation status

### **GitHub Actions Logs**
- **Build Logs**: Docker build output
- **Deployment Logs**: AWS CLI command output
- **Health Check Results**: Service health verification

## 🔒 Security Features

### **SSL/TLS Encryption**
- **Automatic SSL**: Let's Encrypt certificates managed by AWS
- **HTTPS Only**: All traffic encrypted
- **Certificate Renewal**: Automatic renewal before expiration

### **Container Security**
- **Image Scanning**: ECR scans for vulnerabilities
- **Environment Variables**: Sensitive data in environment variables
- **Network Isolation**: Containers isolated in private network

### **Access Control**
- **GitHub Secrets**: AWS credentials stored securely
- **IAM Permissions**: Minimal required permissions
- **Network Security**: Load balancer controls traffic flow

## 💰 Cost Optimization

### **Lightsail Pricing**
- **Container Services**: $7/month each (small power)
- **Load Balancer**: $18/month
- **SSL Certificates**: Free (Let's Encrypt)
- **Total**: ~$32/month for both services + load balancer

### **Scaling Options**
- **Vertical Scaling**: Increase container power (small → medium → large)
- **Horizontal Scaling**: Increase container count
- **Auto-scaling**: Based on CPU/memory usage

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. Build Failures**
- **Dockerfile Issues**: Check Dockerfile syntax
- **Dependencies**: Ensure all dependencies in package.json
- **Build Context**: Verify build context paths

#### **2. Deployment Failures**
- **AWS Credentials**: Verify GitHub Secrets
- **Service Names**: Check Lightsail service names
- **Resource Limits**: Ensure sufficient resources

#### **3. SSL Certificate Issues**
- **DNS Configuration**: Verify domain DNS records
- **Validation**: Check certificate validation status
- **Expiration**: Monitor certificate expiration

#### **4. Health Check Failures**
- **Endpoint Availability**: Verify health check endpoints
- **Port Configuration**: Check port mappings
- **Environment Variables**: Verify required environment variables

### **Debug Commands**
```bash
# Check service status
aws lightsail get-container-service --service-name qr-scanner-frontend --region us-east-1

# View deployment logs
aws lightsail get-container-service-deployments --service-name qr-scanner-frontend --region us-east-1

# Check load balancer status
aws lightsail get-load-balancer --load-balancer-name qr-scanner-lb --region us-east-1
```

## 🔄 Continuous Improvement

### **Pipeline Enhancements**
- **Testing**: Add unit tests and integration tests
- **Security Scanning**: Add vulnerability scanning
- **Performance Testing**: Add load testing
- **Monitoring**: Add application monitoring

### **Infrastructure Improvements**
- **CDN**: Add CloudFront for static assets
- **Database**: Add RDS for production database
- **Monitoring**: Add CloudWatch monitoring
- **Backup**: Add automated backups

This CI/CD pipeline provides a robust, automated deployment system that ensures your QR Scanner Trios application is always up-to-date, secure, and performant.
