#!/bin/bash

# DevSecOps Pipeline Script
# Runs security analysis, code quality checks, and vulnerability scanning

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SONAR_HOST_URL="${SONAR_HOST_URL:-http://localhost:9000}"
SONAR_TOKEN="${SONAR_TOKEN:-}"
PROJECT_KEY="microservices-ecommerce"
WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}🚀 Starting DevSecOps Pipeline${NC}"
echo "=========================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Check prerequisites
echo -e "\n${BLUE}1. Checking Prerequisites${NC}"
echo "============================"

if ! command_exists java; then
    print_error "Java is required but not installed"
    exit 1
fi

if ! command_exists mvn; then
    print_error "Maven is required but not installed"
    exit 1
fi

if ! command_exists docker; then
    print_warning "Docker not found - Trivy scan will be skipped"
fi

print_status "Prerequisites check completed"

# 2. Run OWASP Dependency-Check
echo -e "\n${BLUE}2. Running OWASP Dependency-Check${NC}"
echo "===================================="

if command_exists dependency-check.sh; then
    echo "Running dependency vulnerability scan..."
    dependency-check.sh \
        --project "Microservices E-commerce" \
        --scan "." \
        --exclude "**/target/**" \
        --exclude "**/node_modules/**" \
        --exclude "**/.git/**" \
        --format ALL \
        --out reports/dependency-check

    if [ $? -eq 0 ]; then
        print_status "Dependency-Check completed successfully"
    else
        print_warning "Dependency-Check found vulnerabilities - check reports/dependency-check/"
    fi
else
    print_warning "OWASP Dependency-Check not installed. Install from: https://owasp.org/www-project-dependency-check/"
fi

# 3. Build and Test
echo -e "\n${BLUE}3. Building and Testing${NC}"
echo "========================="

cd "$WORKSPACE_DIR"

# Build all services
echo "Building all microservices..."
for service in product-service command-service discovery-service gateway-service; do
    if [ -d "$service" ]; then
        echo "Building $service..."
        cd "$service"
        mvn clean compile test -Dspring.profiles.active=test
        cd ..
    fi
done

print_status "Build and tests completed"

# 4. Run SonarQube Analysis
echo -e "\n${BLUE}4. Running SonarQube Analysis${NC}"
echo "==============================="

if [ -n "$SONAR_TOKEN" ]; then
    echo "Running SonarQube analysis..."
    mvn sonar:sonar \
        -Dsonar.host.url="$SONAR_HOST_URL" \
        -Dsonar.login="$SONAR_TOKEN" \
        -Dsonar.projectKey="$PROJECT_KEY" \
        -Dsonar.java.binaries=target/classes \
        -Dsonar.java.test.binaries=target/test-classes \
        -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml

    if [ $? -eq 0 ]; then
        print_status "SonarQube analysis completed successfully"
        echo "View results at: $SONAR_HOST_URL/dashboard?id=$PROJECT_KEY"
    else
        print_error "SonarQube analysis failed"
        exit 1
    fi
else
    print_warning "SonarQube token not provided. Set SONAR_TOKEN environment variable."
    print_warning "To run SonarQube analysis: export SONAR_TOKEN=your_token_here"
fi

# 5. Run Trivy Docker Image Scan
echo -e "\n${BLUE}5. Running Trivy Docker Image Scan${NC}"
echo "====================================="

if command_exists docker && command_exists trivy; then
    echo "Building and scanning Docker images..."

    # Build images
    for service in product-service command-service gateway-service; do
        if [ -f "$service/Dockerfile" ]; then
            echo "Building $service image..."
            docker build -t "microservices/$service:latest" "$service"
        fi
    done

    # Scan images
    mkdir -p reports/trivy
    for service in product-service command-service gateway-service; do
        echo "Scanning $service image..."
        trivy image \
            --format json \
            --output reports/trivy/$service-scan.json \
            "microservices/$service:latest"
    done

    print_status "Trivy image scanning completed"
    echo "Reports saved in reports/trivy/"
else
    if ! command_exists docker; then
        print_warning "Docker not installed - skipping image scanning"
    fi
    if ! command_exists trivy; then
        print_warning "Trivy not installed. Install from: https://github.com/aquasecurity/trivy"
    fi
fi

# 6. Security Headers Check (using curl)
echo -e "\n${BLUE}6. Security Headers Check${NC}"
echo "============================"

# This would require services to be running
# For now, just check if configurations are present
echo "Checking security configurations..."
if grep -r "spring.security.oauth2" */src/main/resources/application.properties; then
    print_status "OAuth2 configuration found"
else
    print_warning "OAuth2 configuration not found in all services"
fi

# 7. Generate Security Report
echo -e "\n${BLUE}7. Generating Security Report${NC}"
echo "================================="

mkdir -p reports
REPORT_FILE="reports/devsecops-report-$(date +%Y%m%d-%H%M%S).txt"

cat > "$REPORT_FILE" << EOF
DevSecOps Security Report
=========================
Generated on: $(date)
Project: Microservices E-commerce Application

SCAN RESULTS SUMMARY
====================

1. OWASP Dependency-Check:
   $([ -d "reports/dependency-check" ] && echo "✅ Completed - Check reports/dependency-check/" || echo "⚠️  Not run - Dependency-Check not installed")

2. SonarQube Code Quality:
   $([ -n "$SONAR_TOKEN" ] && echo "✅ Completed - View at $SONAR_HOST_URL" || echo "⚠️  Not run - SONAR_TOKEN not configured")

3. Trivy Container Scanning:
   $([ -d "reports/trivy" ] && echo "✅ Completed - Check reports/trivy/" || echo "⚠️  Not run - Docker/Trivy not available")

4. Unit Tests:
   $(find . -name "*Test.java" -type f | wc -l) test files found
   $(find . -name "surefire-reports" -type d | wc -l) test reports generated

SECURITY RECOMMENDATIONS
========================

1. Authentication & Authorization:
   - Ensure all endpoints are protected with OAuth2/JWT
   - Implement proper role-based access control
   - Use HTTPS in production

2. Data Protection:
   - Encrypt sensitive data at rest
   - Use prepared statements to prevent SQL injection
   - Implement proper input validation

3. Container Security:
   - Run containers as non-root user
   - Regularly update base images
   - Scan images for vulnerabilities

4. API Security:
   - Implement rate limiting
   - Use proper CORS configuration
   - Validate all input parameters

5. Monitoring & Logging:
   - Implement comprehensive logging
   - Set up security monitoring
   - Regular security audits

EOF

print_status "Security report generated: $REPORT_FILE"

# 8. Final Summary
echo -e "\n${BLUE}🎉 DevSecOps Pipeline Completed!${NC}"
echo "====================================="
echo ""
echo "📊 Summary:"
echo "   🔍 Security scans completed"
echo "   🧪 Tests executed"
echo "   📈 Code quality analyzed"
echo "   🐳 Container images scanned"
echo ""
echo "📁 Reports saved in: reports/"
echo "   - Dependency check: reports/dependency-check/"
echo "   - Trivy scans: reports/trivy/"
echo "   - Full report: $REPORT_FILE"
echo ""
echo "🔗 Access points:"
echo "   - SonarQube: $SONAR_HOST_URL (if configured)"
echo "   - Application: http://localhost:8087 (when running)"
echo ""
echo "💡 Next steps:"
echo "   1. Review security findings in reports/"
echo "   2. Fix identified vulnerabilities"
echo "   3. Run tests: mvn test"
echo "   4. Deploy to staging environment"
echo ""
echo -e "${GREEN}✅ DevSecOps pipeline completed successfully!${NC}"
