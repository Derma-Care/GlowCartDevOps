package com.glowkart.admin.service;



import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.glowkart.admin.client.BookingServiceClient;
import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.BookingResponseDTO;
import com.glowkart.admin.dto.ClinicRatingsResponseDTO;
import com.glowkart.admin.dto.UpdateBookingStatusDTO;

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

    /**
     * Update booking status for a given bookingId
     */
    public BookingResponseDTO updateBookingStatus(String bookingId, String status) {
        UpdateBookingStatusDTO request = new UpdateBookingStatusDTO();
        request.setBookingId(bookingId);
        request.setStatus(status);

        ApiResponse<BookingResponseDTO> response = bookingServiceClient.updateBookingStatus(request);

        if (response == null) {
            throw new RuntimeException("Booking service did not respond");
        }

        if (response.isSuccess() && response.getData() != null) {
            return response.getData();
        } else {
            throw new RuntimeException("Failed to update booking status: " + response.getMessage());
        }
    }
    
    public ClinicRatingsResponseDTO getClinicRatings(String clinicId) {

        ApiResponse<ClinicRatingsResponseDTO> response =
                bookingServiceClient.getClinicRatings(clinicId);

        if (response == null || !response.isSuccess() || response.getData() == null) {
            throw new RuntimeException("Unable to fetch clinic ratings");
        }

        return response.getData();
    }
}

