package com.glowkart.booking.scheduler;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.glowkart.booking.model.Booking;
import com.glowkart.booking.repository.BookingRepository;
import com.glowkart.booking.service.NotificationProducer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingReminderScheduler {

    private final BookingRepository bookingRepository;
    private final NotificationProducer notificationProducer;

 // Runs every day at 11:23 AM
 // Runs every day at 12:10 PM
//    @Scheduled(cron = "0 0 7 * * ?", zone = "Asia/Kolkata")
//    @Scheduled(cron = "0 30 12 * * ?", zone = "Asia/Kolkata")
    
 // Runs every day at 3:15 PM IST
 // Runs every day at 4:10 PM IST
    @Scheduled(cron = "0 0 7 * * ?", zone = "Asia/Kolkata")
    public void sendTodayAppointmentReminders() {

        String today = LocalDate.now(ZoneId.of("Asia/Kolkata"))
                .format(DateTimeFormatter.ISO_DATE);

        log.info("Running appointment reminder job for date: {}", today);

        List<Booking> bookings =
                bookingRepository.findByAppointmentDateAndStatus(today, "CONFIRMED");

        log.info("Found {} bookings for reminder", bookings.size());

        for (Booking booking : bookings) {

            if (booking.getDeviceToken() == null || booking.getDeviceToken().isBlank()) {
                log.warn("Skipping booking {} due to missing device token", booking.getBookingId());
                continue;
            }

            notificationProducer.sendAppointmentReminder(
                    booking.getCustomerId(),
                    booking.getDeviceToken(),
                    booking.getBookingId(),
                    booking.getClinicName(),
                    booking.getClinicAddress(),
                    booking.getAppointmentDate()
            );
        }
    }

}
