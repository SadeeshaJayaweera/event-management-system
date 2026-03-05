FROM maven:3.9.4-eclipse-temurin-17 as builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN for i in 1 2 3 4 5; do mvn clean package -DskipTests && break; done

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN apk add --no-cache wget
EXPOSE 8888
ENTRYPOINT ["java", "-jar", "app.jar"]
