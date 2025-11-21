package com.glowkart.admin.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;

@Configuration
@EnableRetry
public class RetryConfig {
    // No bean needed for basic retry, @Retryable annotation handles it
}
