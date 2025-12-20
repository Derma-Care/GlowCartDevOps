package com.glowkart.customer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glowkart.customer.dto.NotificationEvent;
import com.glowkart.customer.model.Customer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class NotificationProducer {

    private final SqsClient sqsClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${aws.sqs.notification-queue-url}")
    private String queueUrl;

    public NotificationProducer(SqsClient sqsClient) {
        this.sqsClient = sqsClient;
    }

    public void sendLoginSuccess(Customer customer) {
        try {
        	NotificationEvent event = NotificationEvent.builder()
        	        .eventId(UUID.randomUUID().toString())
        	        .customerId(customer.getCustomerId())
        	        .deviceToken(customer.getDeviceToken()) // ✅ ADD
        	        .title("Login Successful 🎉")
        	        .message("Welcome back to GlowKart")
        	        .type("LOGIN")
        	        .channels(List.of("PUSH"))
        	        .build();

            sqsClient.sendMessage(
                    SendMessageRequest.builder()
                            .queueUrl(queueUrl)
                            .messageBody(objectMapper.writeValueAsString(event))
                            .build()
            );

            log.info("Notification sent for customerId={}", customer.getCustomerId());

        } catch (Exception e) {
            log.error("Failed to publish notification", e);
        }
    }

}
