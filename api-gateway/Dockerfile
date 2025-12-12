# ===============================
# Stage 1: Build Stage (Maven)
# ===============================
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom first (dependency caching)
COPY pom.xml .
RUN mvn -q dependency:go-offline

# Copy full source code
COPY src ./src

# Build the Spring Boot application
RUN mvn -q clean package -DskipTests

# ===============================
# Stage 2: Runtime Stage
# ===============================
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy built jar (auto detect jar name)
COPY --from=build /app/target/*.jar /app/service.jar

# Expose default Spring Boot port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "/app/service.jar"]
