package com.glowkart.booking.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glowkart.booking.dto.NotificationEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationProducer {

    private final SqsClient sqsClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${aws.sqs.notification-queue-url}")
    private String queueUrl;
    
    public void sendBookingCreated(String customerId,
            String deviceToken,
            String bookingId,
            String clinicName,
            String clinicAddress,
            String appointmentDate) {

		try {
		
			// Format date (2026-02-20 → 20 Feb 2026)
			LocalDate date = LocalDate.parse(appointmentDate);
			String formattedDate = date.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

			String title = "Appointment Confirmed";

			String message = String.format(
			        "🎉 Your appointment has been successfully booked!\n\n" +
			        "🏥 Clinic: %s\n" +
			        "📍 Address: %s\n" +
			        "🗓 Date: %s\n\n" +
			        "We look forward to welcoming you!",
			        clinicName,
			        clinicAddress,
			        formattedDate
			);

		
		NotificationEvent event = NotificationEvent.builder()
		.eventId(UUID.randomUUID().toString())
		.customerId(customerId)
		.deviceToken(deviceToken)
		.title(title)
		.message(message)
		.type("BOOKING_CREATED")
		.channels(List.of("PUSH"))
		.build();
		
		sqsClient.sendMessage(
		SendMessageRequest.builder()
		     .queueUrl(queueUrl)
		     .messageBody(objectMapper.writeValueAsString(event))
		     .build()
		);
		
		log.info("Booking confirmation notification sent for bookingId={}", bookingId);
		
		} catch (Exception e) {
		log.error("Failed to send booking notification", e);
		}
		}

    public void sendAppointmentReminder(String customerId,
            String deviceToken,
            String bookingId,
            String clinicName,
            String clinicAddress,
            String appointmentDate) {

		try {
		
				LocalDate date = LocalDate.parse(appointmentDate);
				String formattedDate = date.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
				
				String title = "⏰ Appointment Reminder";
				
				String message = String.format(
				"Good morning! 🌞\n\n" +
				"This is a reminder for your appointment today.\n\n" +
				"🏥 Clinic: %s\n" +
				"📍 Address: %s\n" +
				"🗓 Date: %s\n\n" +
				"We look forward to seeing you!",
				clinicName,
				clinicAddress,
				formattedDate
			);
		
		NotificationEvent event = NotificationEvent.builder()
		.eventId(UUID.randomUUID().toString())
		.customerId(customerId)
		.deviceToken(deviceToken)
		.title(title)
		.message(message)
		.type("BOOKING_REMINDER")
		.channels(List.of("PUSH"))
		.build();
		
		sqsClient.sendMessage(
		SendMessageRequest.builder()
		.queueUrl(queueUrl)
		.messageBody(objectMapper.writeValueAsString(event))
		.build()
		);
		
		log.info("Reminder notification sent for bookingId={}", bookingId);
		
		} catch (Exception e) {
		log.error("Failed to send reminder notification", e);
		}
		}
		

    public void sendBookingCompleted(
            String customerId,
            String deviceToken,
            String bookingId,
            String clinicName,
            String clinicAddress,
            String appointmentDate) {

        try {

            LocalDate date = LocalDate.parse(appointmentDate);
            String formattedDate = date.format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

            String title = "🎉 Treatment Completed";

            String message = String.format(
                    "Your appointment has been successfully completed!\n\n" +
                    "🏥 Clinic: %s\n" +
                    "📍 Address: %s\n" +
                    "🗓 Date: %s\n\n" +
                    "Thank you for choosing GlowKart 💙",
                    clinicName,
                    clinicAddress,
                    formattedDate
            );

            NotificationEvent event = NotificationEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .customerId(customerId)
                    .deviceToken(deviceToken)
                    .title(title)
                    .message(message)
                    .type("BOOKING_COMPLETED")
                    .channels(List.of("PUSH"))
                    .build();

            sqsClient.sendMessage(
                    SendMessageRequest.builder()
                            .queueUrl(queueUrl)
                            .messageBody(objectMapper.writeValueAsString(event))
                            .build()
            );

            log.info("Booking completed notification sent for bookingId={}", bookingId);

        } catch (Exception e) {
            log.error("Failed to send completed notification", e);
        }
    }
}
