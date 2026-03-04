package com.eventflow.reviewservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI reviewServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Review Service API")
                        .description("REST API for managing event reviews and ratings in the EventFlow platform. " +
                                "Allows users to create, update, and delete reviews for events they have attended, " +
                                "and provides rating analytics per event.")
                        .version("v0.1.0")
                        .contact(new Contact()
                                .name("EventFlow Team")
                                .email("support@eventflow.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("API Gateway"),
                        new Server().url("http://localhost:8089").description("Direct Review Service")
                ));
    }
}
