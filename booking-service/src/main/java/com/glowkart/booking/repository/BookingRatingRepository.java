package com.glowkart.booking.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.glowkart.booking.model.BookingRating;

public interface BookingRatingRepository extends MongoRepository<BookingRating, String> {

    Optional<BookingRating> findByBookingId(String bookingId);

	boolean existsByBookingId(String bookingId);
}
