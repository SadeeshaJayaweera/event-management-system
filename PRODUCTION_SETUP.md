# Production Setup Guide

## Overview
This guide provides step-by-step instructions to deploy the Event Management System to production with all security measures in place.

## Prerequisites
- Java 17+
- Maven 3.6+
- Node.js 18+
- MySQL 8.0+
- Docker & Docker Compose (optional)
- SSL/TLS Certificate (for HTTPS)

---

## Phase 1: Security Configuration

### 1.1 Generate JWT Secret
```bash
# Generate a cryptographically secure JWT secret
openssl rand -base64 64

# Output example:
# bXlTZWNyZXRLZXkxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ=
```

### 1.2 Create Environment Configuration
```bash
# Copy production template
cp .env.production .env.local

# Edit with your values
nano .env.local
```

**Required Environment Variables:**
```bash
# JWT
JWT_SECRET=<your-generated-secret>
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Database
SPRING_DATASOURCE_URL=jdbc:mysql://db-host:3306/userdb
SPRING_DATASOURCE_USERNAME=<db-user>
SPRING_DATASOURCE_PASSWORD=<strong-password>

# OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_GATEWAY_URL=https://api.yourdomain.com
```

### 1.3 Generate SSL/TLS Certificate
```bash
# Using Let's Encrypt (recommended)
certbot certonly --standalone -d api.yourdomain.com

# Or generate self-signed (for testing)
keytool -genkey -alias tomcat -storetype PKCS12 \
  -keyalg RSA -keysize 2048 -keystore keystore.p12 \
  -validity 365 -storepass changeit
```

---

## Phase 2: Database Setup

### 2.1 Create Databases
```bash
mysql -u root -p

CREATE DATABASE userdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE eventdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE bookingdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create database users with strong passwords
CREATE USER 'useruser'@'localhost' IDENTIFIED BY '<strong-password>';
CREATE USER 'eventuser'@'localhost' IDENTIFIED BY '<strong-password>';
CREATE USER 'bookinguser'@'localhost' IDENTIFIED BY '<strong-password>';

# Grant privileges
GRANT ALL PRIVILEGES ON userdb.* TO 'useruser'@'localhost';
GRANT ALL PRIVILEGES ON eventdb.* TO 'eventuser'@'localhost';
GRANT ALL PRIVILEGES ON bookingdb.* TO 'bookinguser'@'localhost';

FLUSH PRIVILEGES;
EXIT;
```

### 2.2 Enable Database Encryption
```bash
# For MySQL 8.0+, enable InnoDB encryption
mysql -u root -p

SET GLOBAL innodb_encrypt_tables=ON;
SET GLOBAL innodb_encrypt_log=ON;
```

### 2.3 Configure Database Backups
```bash
# Create backup script
cat > /usr/local/bin/backup-databases.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

mysqldump -u root -p$MYSQL_ROOT_PASSWORD --all-databases \
  --single-transaction --quick --lock-tables=false \
  > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-databases.sh

# Schedule daily backups
echo "0 2 * * * /usr/local/bin/backup-databases.sh" | crontab -
```

---

## Phase 3: Build & Deployment

### 3.1 Build All Services
```bash
# Build discovery server
cd discovery
mvn clean package -DskipTests
cd ..

# Build config server
cd config-server
mvn clean package -DskipTests
cd ..

# Build API gateway
cd gateway
mvn clean package -DskipTests
cd ..

# Build backend services
cd backend/user-service
mvn clean package -DskipTests
cd ../..

cd backend/event-service
mvn clean package -DskipTests
cd ../..

cd backend/booking-service
mvn clean package -DskipTests
cd ../..

# Build frontend
cd frontend
npm install
npm run build
cd ..
```

### 3.2 Docker Deployment (Recommended)
```bash
# Build Docker images
docker-compose build

# Start all services
docker-compose up -d

# Verify services
docker-compose ps

# View logs
docker-compose logs -f
```

### 3.3 Manual Deployment
```bash
# Terminal 1 - Discovery Server
java -jar discovery/target/discovery-0.0.1-SNAPSHOT.jar

# Terminal 2 - Config Server (wait 30s)
java -jar config-server/target/config-server-0.0.1-SNAPSHOT.jar

# Terminal 3 - API Gateway (wait 30s)
java -jar gateway/target/gateway-0.0.1-SNAPSHOT.jar

# Terminal 4 - User Service
java -jar backend/user-service/target/user-service-0.0.1-SNAPSHOT.jar

# Terminal 5 - Event Service
java -jar backend/event-service/target/event-service-0.0.1-SNAPSHOT.jar

# Terminal 6 - Booking Service
java -jar backend/booking-service/target/booking-service-0.0.1-SNAPSHOT.jar

# Terminal 7 - Frontend
cd frontend && npm start
```

---

## Phase 4: Security Hardening

### 4.1 Enable HTTPS
```bash
# Update gateway configuration
cat >> gateway/src/main/resources/application.yml << 'EOF'

server:
  ssl:
    enabled: true
    key-store: /path/to/keystore.p12
    key-store-password: ${SSL_KEYSTORE_PASSWORD}
    key-store-type: PKCS12
    key-alias: tomcat
EOF
```

### 4.2 Configure Firewall
```bash
# Allow only necessary ports
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow internal services (if on same network)
sudo ufw allow from 192.168.1.0/24 to any port 8761
sudo ufw allow from 192.168.1.0/24 to any port 8080
```

### 4.3 Set Up Rate Limiting
```bash
# Using nginx as reverse proxy
cat > /etc/nginx/sites-available/api.yourdomain.com << 'EOF'
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com \
  /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 4.4 Enable Monitoring & Logging
```bash
# Install ELK Stack (Elasticsearch, Logstash, Kibana)
docker run -d --name elasticsearch \
  -e "discovery.type=single-node" \
  -p 9200:9200 \
  docker.elastic.co/elasticsearch/elasticsearch:8.0.0

# Configure application logging
cat >> backend/user-service/src/main/resources/application.yml << 'EOF'
logging:
  level:
    root: INFO
    com.nsbm: DEBUG
  file:
    name: logs/user-service.log
    max-size: 10MB
    max-history: 30
EOF
```

### 4.5 Set Up Monitoring Alerts
```bash
# Install Prometheus
docker run -d --name prometheus \
  -p 9090:9090 \
  -v /path/to/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# Install Grafana
docker run -d --name grafana \
  -p 3000:3000 \
  grafana/grafana
```

---

## Phase 5: Verification & Testing

### 5.1 Health Checks
```bash
# Check all services
curl https://api.yourdomain.com/actuator/health

# Check Eureka
curl https://api.yourdomain.com:8761/eureka/apps

# Check individual services
curl https://api.yourdomain.com/api/users/health
curl https://api.yourdomain.com/api/events/health
curl https://api.yourdomain.com/api/bookings/health
```

### 5.2 Security Testing
```bash
# Test public endpoint (should work)
curl https://api.yourdomain.com/api/events

# Test protected endpoint without token (should fail)
curl https://api.yourdomain.com/api/users

# Test registration
curl -X POST https://api.yourdomain.com/api/users/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "phone": "1234567890"
  }'

# Test login
curl -X POST https://api.yourdomain.com/api/users/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'

# Test protected endpoint with token
TOKEN="<token-from-login>"
curl -H "Authorization: Bearer $TOKEN" \
  https://api.yourdomain.com/api/users
```

### 5.3 Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Run load test
ab -n 1000 -c 10 https://api.yourdomain.com/api/events

# Or use wrk
wrk -t4 -c100 -d30s https://api.yourdomain.com/api/events
```

### 5.4 Security Scanning
```bash
# OWASP Dependency Check
mvn org.owasp:dependency-check-maven:check

# SonarQube
mvn sonar:sonar \
  -Dsonar.projectKey=event-management-system \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<sonar-token>
```

---

## Phase 6: Maintenance & Operations

### 6.1 Regular Updates
```bash
# Update dependencies
mvn versions:display-dependency-updates
mvn versions:display-plugin-updates

# Update npm packages
npm outdated
npm update

# Update system packages
sudo apt-get update
sudo apt-get upgrade
```

### 6.2 Log Rotation
```bash
# Configure logrotate
cat > /etc/logrotate.d/event-management << 'EOF'
/var/log/event-management/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 app app
    sharedscripts
    postrotate
        systemctl reload event-management > /dev/null 2>&1 || true
    endscript
}
EOF
```

### 6.3 Database Maintenance
```bash
# Optimize tables
mysql -u root -p -e "OPTIMIZE TABLE userdb.users; OPTIMIZE TABLE eventdb.events;"

# Check table integrity
mysql -u root -p -e "CHECK TABLE userdb.users; CHECK TABLE eventdb.events;"

# Analyze tables
mysql -u root -p -e "ANALYZE TABLE userdb.users; ANALYZE TABLE eventdb.events;"
```

### 6.4 Security Audits
```bash
# Monthly security checklist
- Review access logs for suspicious activity
- Check for failed login attempts
- Verify SSL certificate expiration
- Review user roles and permissions
- Check for outdated dependencies
- Review firewall rules
- Test backup restoration
- Verify monitoring alerts
```

---

## Phase 7: Disaster Recovery

### 7.1 Backup Strategy
```bash
# Daily backups
0 2 * * * /usr/local/bin/backup-databases.sh

# Weekly full backups
0 3 * * 0 /usr/local/bin/backup-full.sh

# Monthly archive
0 4 1 * * /usr/local/bin/backup-archive.sh
```

### 7.2 Restore Procedure
```bash
# Restore from backup
mysql -u root -p < /backups/mysql/backup_20260204_020000.sql

# Verify restoration
mysql -u root -p -e "SELECT COUNT(*) FROM userdb.users;"
```

### 7.3 Failover Setup
```bash
# Configure MySQL replication for high availability
# Master-Slave setup for automatic failover
```

---

## Troubleshooting

### Common Issues

**Issue**: Services not registering with Eureka
```bash
# Solution: Wait 30-60 seconds, check logs
docker-compose logs discovery
```

**Issue**: Database connection errors
```bash
# Solution: Verify credentials and network
mysql -h localhost -u useruser -p -e "SELECT 1;"
```

**Issue**: SSL certificate errors
```bash
# Solution: Verify certificate path and permissions
ls -la /path/to/keystore.p12
chmod 600 /path/to/keystore.p12
```

**Issue**: High memory usage
```bash
# Solution: Increase JVM heap size
export JAVA_OPTS="-Xmx2g -Xms1g"
```

---

## Support & Documentation

- **Security Issues**: security@yourdomain.com
- **Technical Support**: support@yourdomain.com
- **Documentation**: https://docs.yourdomain.com
- **Status Page**: https://status.yourdomain.com

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Status**: Production Ready

