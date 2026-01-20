package com.glowkart.booking.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.glowkart.booking.dto.BookingProcedureDTO;
import com.glowkart.booking.model.BookingRating;

public interface BookingRatingRepository extends MongoRepository<BookingRating, String> {

    Optional<BookingRating> findByBookingId(String bookingId);

	boolean existsByBookingId(String bookingId);

	   List<BookingRating> findByClinicId(String clinicId);
	   List<BookingRating> findByServiceId(String serviceId);

	   @Aggregation(pipeline = {
			    "{ $match: { clinicId: ?0 } }",
			    "{ $group: { _id: null, averageRating: { $avg: '$rating' } } }"
			})
			Double getAverageRatingByClinicId(String clinicId);

	Collection<BookingProcedureDTO> findByClinicIdOrderByCreatedAtDesc(String clinicId);
}
