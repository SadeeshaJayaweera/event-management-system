FROM maven:3.9.4-eclipse-temurin-17 as builder
WORKDIR /app
COPY pom.xml .
RUN mvn -Dhttps.protocols=TLSv1.2 dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]

