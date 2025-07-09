# ------------ Stage 1: Build the JAR ------------
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Set working directory inside container
WORKDIR /app

# Copy everything to container
COPY . .

# Build the JAR
RUN mvn clean package -DskipTests


# ------------ Stage 2: Run the JAR ------------
FROM eclipse-temurin:21

# Set working directory inside container
WORKDIR /app

# Copy the JAR from previous stage
COPY --from=build /app/target/*.jar app.jar

# Expose the app port
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
