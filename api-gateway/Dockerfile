# -------------------------------
# Stage 1: Build the application
# -------------------------------
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only Maven project files first to cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build the Spring Boot jar (skip tests for faster builds)
RUN mvn clean package -DskipTests -Dspring-boot.build-image.skip=true

# -------------------------------
# Stage 2: Minimal runtime image
# -------------------------------
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/api-gateway-0.0.1-SNAPSHOT.jar /app/api-gateway.jar

# Expose the port (matches your Spring Boot application.yml)
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "api-gateway.jar"]
