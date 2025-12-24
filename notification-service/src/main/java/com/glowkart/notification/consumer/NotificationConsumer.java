package com.glowkart.notification.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glowkart.notification.model.AppNotification;
import com.glowkart.notification.model.NotificationEvent;
import com.glowkart.notification.repository.NotificationRepository;
import com.glowkart.notification.service.NotificationProcessor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.DeleteMessageRequest;
import software.amazon.awssdk.services.sqs.model.Message;
import software.amazon.awssdk.services.sqs.model.ReceiveMessageRequest;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationConsumer {

    private final SqsClient sqsClient;
    private final NotificationProcessor processor;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${aws.sqs.notification-queue-url}")
    private String queueUrl;

    @Scheduled(fixedDelayString = "${sqs.polling-delay:5000}")
    public void pollQueue() {
        try {
            log.info("Polling SQS queue: {}", queueUrl);

            List<Message> messages = sqsClient.receiveMessage(
                    ReceiveMessageRequest.builder()
                            .queueUrl(queueUrl)
                            .maxNumberOfMessages(10)
                            .waitTimeSeconds(5)
                            .build()
            ).messages();

            log.info("Received {} messages from SQS", messages.size());

            for (Message msg : messages) {
                processMessage(msg);
            }

        } catch (Exception e) {
            log.error("Error polling SQS queue", e);
        }
    }

    private void processMessage(Message msg) {
        String messageId = msg.messageId();
        try {
            NotificationEvent event =
                    objectMapper.readValue(msg.body(), NotificationEvent.class);

            log.info("Received SQS message: eventId={} customerId={} messageId={}",
                    event.getEventId(), event.getCustomerId(), messageId);

            // ✅ Single responsibility
            processor.process(event);

            sqsClient.deleteMessage(DeleteMessageRequest.builder()
                    .queueUrl(queueUrl)
                    .receiptHandle(msg.receiptHandle())
                    .build());

            log.info("Deleted SQS message: eventId={} messageId={}",
                    event.getEventId(), messageId);

        } catch (Exception e) {
            log.error("Failed processing SQS message: messageId={}", messageId, e);
        }
    }
}
