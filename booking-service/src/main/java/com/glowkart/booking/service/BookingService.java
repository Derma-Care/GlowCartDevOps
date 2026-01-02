package com.glowkart.booking.service;

import com.glowkart.booking.dto.*;

import java.util.List;

public interface BookingService {

	BookingPriceResponseDTO calculateFinalAmountWithPoints(BookingPriceRequestDTO request);

    BookingResponseDTO createBooking(BookingRequestDTO request);

    BookingResponseDTO cancelBooking(CancelBookingDTO request);

    BookingResponseDTO rescheduleBooking(RescheduleBookingDTO request);

    List<BookingResponseDTO> getCustomerBookings(String customerId);

	List<BookingResponseDTO> getClinicBookings(String clinicId);

	BookingResponseDTO updateBookingStatus(UpdateBookingStatusDTO request);

	BookingRatingResponseDTO rateBooking(RatingDTO request);

	

}
