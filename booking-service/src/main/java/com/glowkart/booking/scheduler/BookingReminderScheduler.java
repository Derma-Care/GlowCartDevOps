package com.glowkart.booking.scheduler;

import com.glowkart.booking.model.Booking;
import com.glowkart.booking.repository.BookingRepository;
import com.glowkart.booking.service.NotificationProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingReminderScheduler {

    private final BookingRepository bookingRepository;
    private final NotificationProducer notificationProducer;

 // Runs every day at 11:23 AM
 // Runs every day at 12:10 PM
    @Scheduled(cron = "0 10 12 * * ?")


    public void sendTodayAppointmentReminders() {

        String today = LocalDate.now().format(DateTimeFormatter.ISO_DATE);

        log.info("Running appointment reminder job for date: {}", today);

        List<Booking> bookings =
                bookingRepository.findByAppointmentDateAndStatus(today, "CONFIRMED");

        for (Booking booking : bookings) {

            notificationProducer.sendAppointmentReminder(
                    booking.getCustomerId(),
                    booking.getDeviceToken(), // ensure stored in booking
                    booking.getBookingId(),
                    booking.getClinicName(),
                    booking.getClinicAddress(),
                    booking.getAppointmentDate()
            );
        }

        log.info("Sent {} reminder notifications", bookings.size());
    }
}
