# syntax=docker/dockerfile:1

# ---- Build stage: compile the jar with Maven ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Resolve dependencies first so this (slow) layer is cached separately
# from source changes.
COPY pom.xml ./
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- Runtime stage: slim JRE only, non-root user ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S taskflow && adduser -S taskflow -G taskflow
COPY --from=build /build/target/*.jar app.jar
RUN chown taskflow:taskflow app.jar
USER taskflow

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
