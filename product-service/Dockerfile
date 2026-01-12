# Multi-stage build for Product Service
FROM eclipse-temurin:21-jdk-alpine as builder

WORKDIR /app

# First, copy the Maven Wrapper files
COPY mvnw .
COPY .mvn .mvn
# Make mvnw executable
RUN chmod +x mvnw

# Then copy project files
COPY pom.xml .
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 8083
ENTRYPOINT ["java","-jar","/app/app.jar"]