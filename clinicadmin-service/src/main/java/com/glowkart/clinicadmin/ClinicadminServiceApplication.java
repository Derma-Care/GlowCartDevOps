package com.glowkart.clinicadmin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;


@SpringBootApplication
@EnableFeignClients
@EnableDiscoveryClient  // <-- Enable Eureka client
public class ClinicadminServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClinicadminServiceApplication.class, args);
    }
}
