# AWS Lightsail Setup Commands for QR Scanner Trios

## Prerequisites

1. **AWS CLI installed and configured**
2. **Domain names configured**:
   - `orders.mycafe.com` (frontend)
   - `api.mycafe.com` (backend)
3. **DNS records pointing to Lightsail** (after setup)

## 1. Create Lightsail Container Services

### Frontend Service
```bash
# Create frontend container service
aws lightsail create-container-service \
  --service-name qr-scanner-frontend \
  --power small \
  --scale 1 \
  --region us-east-1

# Wait for service to be ready
aws lightsail wait container-service-ready \
  --service-name qr-scanner-frontend \
  --region us-east-1
```

### Backend Service
```bash
# Create backend container service
aws lightsail create-container-service \
  --service-name qr-scanner-backend \
  --power small \
  --scale 1 \
  --region us-east-1

# Wait for service to be ready
aws lightsail wait container-service-ready \
  --service-name qr-scanner-backend \
  --region us-east-1
```

## 2. Create Load Balancer

```bash
# Create Lightsail load balancer
aws lightsail create-load-balancer \
  --load-balancer-name qr-scanner-lb \
  --instance-port 80 \
  --health-check-path /health \
  --region us-east-1

# Wait for load balancer to be ready
aws lightsail wait load-balancer-ready \
  --load-balancer-name qr-scanner-lb \
  --region us-east-1
```

## 3. Attach Services to Load Balancer

```bash
# Attach frontend service to load balancer
aws lightsail attach-instances-to-load-balancer \
  --load-balancer-name qr-scanner-lb \
  --instance-names qr-scanner-frontend \
  --region us-east-1

# Attach backend service to load balancer
aws lightsail attach-instances-to-load-balancer \
  --load-balancer-name qr-scanner-lb \
  --instance-names qr-scanner-backend \
  --region us-east-1
```

## 4. Configure SSL Certificates

### Frontend SSL Certificate
```bash
# Request SSL certificate for frontend domain
aws lightsail create-certificate \
  --certificate-name orderkaro-co-in-cert \
  --domain-name orderkaro.co.in \
  --subject-alternative-names orderkaro.co.in \
  --region us-east-1

# Attach certificate to load balancer
aws lightsail attach-certificate-to-distribution \
  --distribution-name qr-scanner-lb \
  --certificate-name orderkaro-co-in-cert \
  --region us-east-1
```

### Backend SSL Certificate
```bash
# Request SSL certificate for backend domain
aws lightsail create-certificate \
  --certificate-name api-orderkaro-co-in-cert \
  --domain-name api.orderkaro.co.in \
  --subject-alternative-names api.orderkaro.co.in \
  --region us-east-1

# Attach certificate to load balancer
aws lightsail attach-certificate-to-distribution \
  --distribution-name qr-scanner-lb \
  --certificate-name api-orderkaro-co-in-cert \
  --region us-east-1
```

## 5. Configure Domain Mapping

```bash
# Map frontend domain to load balancer
aws lightsail create-distribution \
  --distribution-name qr-scanner-frontend-dist \
  --origin qr-scanner-lb \
  --default-cache-behavior '{
    "behavior": "cache",
    "cachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  }' \
  --region us-east-1

# Map backend domain to load balancer
aws lightsail create-distribution \
  --distribution-name qr-scanner-backend-dist \
  --origin qr-scanner-lb \
  --default-cache-behavior '{
    "behavior": "cache",
    "cachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  }' \
  --region us-east-1
```

## 6. Initial Deployment

### Deploy Frontend
```bash
# Deploy frontend container
aws lightsail put-container-service-deployment \
  --service-name qr-scanner-frontend \
  --public-endpoint containerName=frontend,containerPort=80,healthCheckPath=/ \
  --containers '{
    "frontend": {
      "image": "your-ecr-registry/qr-scanner-frontend:latest",
      "ports": {
        "80": "HTTP"
      },
      "environment": {
        "NODE_ENV": "production",
        "PORT": "80"
      }
    }
  }' \
  --region us-east-1
```

### Deploy Backend
```bash
# Deploy backend container
aws lightsail put-container-service-deployment \
  --service-name qr-scanner-backend \
  --public-endpoint containerName=backend,containerPort=5001,healthCheckPath=/health \
  --containers '{
    "backend": {
      "image": "your-ecr-registry/qr-scanner-backend:latest",
      "ports": {
        "5001": "HTTP"
      },
      "environment": {
        "NODE_ENV": "production",
        "PORT": "5001",
        "DB_HOST": "your-rds-endpoint",
        "DB_USER": "your-db-user",
        "DB_PASS": "your-db-password",
        "DB_NAME": "qr_ordering_db"
      }
    }
  }' \
  --region us-east-1
```

## 7. DNS Configuration

After setup, configure your DNS records:

```
# A records pointing to Lightsail load balancer
orderkaro.co.in       A    <lightsail-lb-ip>
api.orderkaro.co.in   A    <lightsail-lb-ip>

# CNAME records for SSL validation
_validation.orderkaro.co.in       CNAME    <ssl-validation-record>
_validation.api.orderkaro.co.in   CNAME    <ssl-validation-record>
```

## 8. Health Check Endpoints

- **Frontend**: `https://orderkaro.co.in/` (serves React app)
- **Backend**: `https://api.orderkaro.co.in/health` (API health check)
- **Backend API**: `https://api.orderkaro.co.in/api/*` (all API endpoints)

## 9. Monitoring and Logs

```bash
# View container service logs
aws lightsail get-container-service-deployments \
  --service-name qr-scanner-frontend \
  --region us-east-1

# View load balancer metrics
aws lightsail get-load-balancer-metric-data \
  --load-balancer-name qr-scanner-lb \
  --metric-name RequestCount \
  --period 300 \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --region us-east-1
```

## 10. Cost Optimization

- **Container Services**: $7/month each (small power)
- **Load Balancer**: $18/month
- **SSL Certificates**: Free (Let's Encrypt)
- **Total**: ~$32/month for both services + load balancer

## 11. Scaling Commands

```bash
# Scale frontend service
aws lightsail update-container-service \
  --service-name qr-scanner-frontend \
  --power medium \
  --scale 2 \
  --region us-east-1

# Scale backend service
aws lightsail update-container-service \
  --service-name qr-scanner-backend \
  --power medium \
  --scale 2 \
  --region us-east-1
```

## 12. Backup and Recovery

```bash
# Create snapshot of container service
aws lightsail create-container-service-deployment \
  --service-name qr-scanner-frontend \
  --public-endpoint containerName=frontend,containerPort=80,healthCheckPath=/ \
  --containers '{
    "frontend": {
      "image": "your-ecr-registry/qr-scanner-frontend:backup-tag",
      "ports": {
        "80": "HTTP"
      }
    }
  }' \
  --region us-east-1
```

## Troubleshooting

### Common Issues

1. **SSL Certificate Validation**
   - Ensure DNS records are properly configured
   - Wait for certificate validation (can take up to 24 hours)

2. **Container Service Not Starting**
   - Check container logs: `aws lightsail get-container-service-deployments`
   - Verify environment variables
   - Check health check endpoints

3. **Load Balancer Issues**
   - Verify health check paths
   - Check security groups
   - Ensure ports are correctly mapped

### Useful Commands

```bash
# Get service status
aws lightsail get-container-service --service-name qr-scanner-frontend --region us-east-1

# Get load balancer status
aws lightsail get-load-balancer --load-balancer-name qr-scanner-lb --region us-east-1

# View SSL certificate status
aws lightsail get-certificate --certificate-name orders-mycafe-com-cert --region us-east-1
```

This setup provides a robust, scalable infrastructure for your QR Scanner Trios application with automatic SSL certificates and load balancing.
