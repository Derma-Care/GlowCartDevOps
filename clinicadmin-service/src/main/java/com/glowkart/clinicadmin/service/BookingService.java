package com.glowkart.clinicadmin.service;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.BookingResponseDTO;
import com.glowkart.clinicadmin.feign.BookingServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingServiceClient bookingServiceClient;

    /**
     * Fetch bookings for a specific clinic
     */
    public List<BookingResponseDTO> getBookingsForClinic(String clinicId) {
        ApiResponse<List<BookingResponseDTO>> response = bookingServiceClient.getBookingsByClinic(clinicId);

        if (response == null) {
            throw new RuntimeException("Booking service did not respond");
        }

        if (response.isSuccess() && response.getData() != null) {
            return response.getData();
        } else {
            throw new RuntimeException("Failed to fetch clinic bookings: " + response.getMessage());
        }
    }

    /**
     * Fetch bookings for a specific customer
     */
    public List<BookingResponseDTO> getBookingsForCustomer(String customerId) {
        ApiResponse<List<BookingResponseDTO>> response = bookingServiceClient.getBookingsByCustomer(customerId);

        if (response == null) {
            throw new RuntimeException("Booking service did not respond");
        }

        if (response.isSuccess() && response.getData() != null) {
            return response.getData();
        } else {
            throw new RuntimeException("Failed to fetch customer bookings: " + response.getMessage());
        }
    }
}
