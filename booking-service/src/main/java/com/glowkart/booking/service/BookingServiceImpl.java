package com.glowkart.booking.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.glowkart.booking.client.ClinicServiceClient;
import com.glowkart.booking.client.CustomerInfoClient;
import com.glowkart.booking.client.ProcedureServiceClient;
import com.glowkart.booking.dto.*;
import com.glowkart.booking.model.Booking;
import com.glowkart.booking.model.BookingRating;
import com.glowkart.booking.repository.BookingRatingRepository;
import com.glowkart.booking.repository.BookingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingRatingRepository bookingRatingRepository;

    private final CustomerInfoClient customerInfoClient;
    private final ProcedureServiceClient procedureClient;
    private final ClinicServiceClient clinicClient;
    private final PaymentService paymentService;
    private final WalletService walletService;

    // ================= PRICE CALCULATION =================
    @Override
    public BookingPriceResponseDTO calculateFinalAmountWithPoints(BookingPriceRequestDTO request) {
        double originalAmount = fetchServiceFinalCost(request.getServiceType(), request.getServiceId());
        CustomerDTO customer = fetchCustomer(request.getCustomerId());

        int availablePoints = walletService.getWalletSummary(customer.getMobile()).getBalance();
        int maxRedeemablePoints = availablePoints / 2;
        int appliedPoints = Math.min(request.getPointsToRedeem(), maxRedeemablePoints);

        double finalAmount = Math.max(originalAmount - appliedPoints, 0);

        return BookingPriceResponseDTO.builder()
                .originalFinalAmount(originalAmount)
                .availablePoints(availablePoints)
                .maxRedeemablePoints(maxRedeemablePoints)
                .appliedPoints(appliedPoints)
                .finalAmount(finalAmount)
                .build();
    }

    // ================= CREATE BOOKING =================
    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        validateAppointmentDate(request.getAppointmentDate());

        CustomerDTO customer = fetchCustomer(request.getCustomerId());
        ClinicDTO clinic = fetchClinic(request.getClinicId());
        PricingDetails pricing = fetchPricingDetails(request.getServiceType(), request.getServiceId());
        List<BookingProcedureDTO> procedures = fetchBookingProcedures(request.getServiceType(), request.getServiceId());

        // ======= Dynamic partial payment calculation =======
        double partialPaymentPercentage = pricing.getPartialPaymentPercentage() > 0 
                ? pricing.getPartialPaymentPercentage() 
                : 100;

        double partialAmount = Math.round(pricing.getFinalAmount() * partialPaymentPercentage / 100.0 * 100.0) / 100.0;
        double dueAmount = Math.round((pricing.getFinalAmount() - partialAmount) * 100.0) / 100.0;

        Booking booking = Booking.builder()
                .bookingId(UUID.randomUUID().toString())
                // Customer
                .customerId(customer.getCustomerId())
                .mobileNumber(customer.getMobile())
                .fullName(customer.getFullName())
                .city(customer.getCity())
                .dob(customer.getDob())
                .gender(customer.getGender())
                // Clinic
                .clinicId(clinic.getClinicId())
                .clinicName(clinic.getName())
                .clinicAddress(clinic.getAddress())
                // Service
                .serviceId(request.getServiceId())
                .serviceName(pricing.getServiceName())
                .serviceType(request.getServiceType())
                .procedures(procedures)
                // Appointment
                .appointmentDate(request.getAppointmentDate())
                .paymentMode(request.getPaymentMode())
                .paymentType(request.getPaymentType())
                // Pricing
                .price(pricing.getPrice())
                .discount(pricing.getDiscountPercentage())
                .discountAmount(pricing.getDiscountAmount())
                .discountedCost(pricing.getDiscountedCost())
                .totalDiscountAmount(pricing.getTotalDiscountAmount())
                .totalDiscountPercentage(pricing.getTotalDiscountPercentage())
                .ngkDiscountAmount(pricing.getNgkDiscountAmount())
                .ngkDiscountPercentage(pricing.getNgkDiscountPercentage())
                .taxPercentage(pricing.getTaxPercentage())
                .taxAmount(pricing.getTaxAmount())
                .gst(pricing.getGst())
                .gstAmount(pricing.getGstAmount())
                .consultationFee(pricing.getConsultationFee())
                // Platform fee
                .platformFeePercentage(pricing.getPlatformFeePercentage())
                .platformFee(pricing.getPlatformFee())
                // Payment breakup
                .finalAmount(pricing.getFinalAmount())
                .partialPaymentPercentage(partialPaymentPercentage)
                .partialAmount(partialAmount)
                .dueAmount(dueAmount)
                // Meta
                .redeemedPoints(0)
                .status("HOLD")
                .paymentStatus("PENDING")
                .isRated(false)
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();

        // ================= WALLET =================
        int pointsToRedeem = validateWalletPoints(booking, request.getPointsToRedeem());

        if (pointsToRedeem > 0) {
            booking.setRedeemedPoints(pointsToRedeem);

            // Subtract points only from service amount, not platform fee
            double serviceAmount = booking.getFinalAmount() - booking.getPlatformFee();
            serviceAmount = Math.max(serviceAmount - pointsToRedeem, 0);

            // Recalculate final amount
            booking.setFinalAmount(serviceAmount + booking.getPlatformFee());

            // Update partial & due amounts accordingly
            partialAmount = Math.round(serviceAmount * partialPaymentPercentage / 100.0 * 100.0) / 100.0;
            dueAmount = Math.round((serviceAmount - partialAmount) * 100.0) / 100.0;

            booking.setPartialAmount(partialAmount);
            booking.setDueAmount(dueAmount);
        }

        // ================= PAYMENT =================
        boolean paymentSuccess = processPayment(booking);
        if (paymentSuccess && pointsToRedeem > 0) {
            walletService.redeemPoints(customer.getCustomerId(), pointsToRedeem);
        }

        booking.setUpdatedAt(Instant.now().toString());
        bookingRepository.save(booking);

        return mapToDTO(booking);
    }

    // ================= WALLET VALIDATION =================
    private int validateWalletPoints(Booking booking, int requestedPoints) {
        if (requestedPoints <= 0) return 0;
        int availablePoints = walletService.getWalletSummary(booking.getMobileNumber()).getBalance();
        int maxRedeemablePoints = availablePoints / 2;
        if (requestedPoints > maxRedeemablePoints) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Requested points exceed maximum redeemable points");
        }
        return requestedPoints;
    }

    // ================= PAYMENT =================
    private boolean processPayment(Booking booking) {
        if ("ONLINE".equalsIgnoreCase(booking.getPaymentMode())) {
            double amount = "PARTIAL_PAYMENT".equalsIgnoreCase(booking.getPaymentType())
                    ? booking.getPartialAmount()
                    : booking.getFinalAmount();

            boolean success = paymentService.pay(booking.getBookingId(), amount);

            booking.setStatus(success ? "CONFIRMED" : "FAILED");
            booking.setPaymentStatus(success
                    ? ("PARTIAL_PAYMENT".equalsIgnoreCase(booking.getPaymentType()) ? "DUE" : "PAID")
                    : "FAILED");
            return success;
        }

        if ("CASH".equalsIgnoreCase(booking.getPaymentMode())) {
            booking.setStatus("CONFIRMED");
            booking.setPaymentStatus(
                    "FULL_PAYMENT".equalsIgnoreCase(booking.getPaymentType()) ? "PENDING" : "DUE"
            );
            return true;
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid paymentMode");
    }

    // ================= HELPERS =================
    private void validateAppointmentDate(String date) {
        LocalDate appointmentDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
        if (appointmentDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Appointment date cannot be in the past");
        }
    }

    private CustomerDTO fetchCustomer(String customerId) {
        ApiResponse<CustomerDTO> response = customerInfoClient.getCustomerId(customerId);
        if (response == null || !response.isSuccess() || response.getData() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
        }
        return response.getData();
    }

    private ClinicDTO fetchClinic(String clinicId) {
        ApiResponse<ClinicDTO> response = clinicClient.getClinicById(clinicId);
        if (response == null || !response.isSuccess() || response.getData() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Clinic not found");
        }
        return response.getData();
    }

    private double fetchServiceFinalCost(String serviceType, String serviceId) {
        if ("PROCEDURE".equalsIgnoreCase(serviceType)) {
            ProcedurePricingDTO p = procedureClient.getPricingByProcedure(serviceId).getData();
            return p.getFinalCost() + Math.max(p.getPlatformFee(), 0);
        }
        if ("PACKAGE".equalsIgnoreCase(serviceType)) {
            ProcedurePackageDTO p = procedureClient.getPricingByPackage(serviceId).getData();
            return p.getFinalCost() + Math.max(p.getPlatformFee(), 0);
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid serviceType");
    }

    private PricingDetails fetchPricingDetails(String serviceType, String serviceId) {
        if ("PROCEDURE".equalsIgnoreCase(serviceType)) {
            return PricingDetails.fromProcedurePricing(procedureClient.getPricingByProcedure(serviceId).getData());
        }
        if ("PACKAGE".equalsIgnoreCase(serviceType)) {
            return PricingDetails.fromPackagePricing(procedureClient.getPricingByPackage(serviceId).getData());
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid serviceType");
    }

    private List<BookingProcedureDTO> fetchBookingProcedures(String serviceType, String serviceId) {
        if (!"PACKAGE".equalsIgnoreCase(serviceType)) return List.of();
        ProcedurePackageDTO pkg = procedureClient.getPricingByPackage(serviceId).getData();
        if (pkg == null || pkg.getProcedures() == null) return List.of();
        return pkg.getProcedures().stream()
                .map(p -> new BookingProcedureDTO(p.getProcedureName(), p.getNoOfSittings()))
                .collect(Collectors.toList());
    }

    private LocalDate parseDate(String dateStr) {
        return dateStr == null || dateStr.isEmpty() ? null : LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE);
    }

    private int calculateAgeAtDate(LocalDate dob, LocalDate onDate) {
        if (dob == null || onDate == null || dob.isAfter(onDate)) return 0;
        return Period.between(dob, onDate).getYears();
    }

    private String formatAge(int age) {
        return age <= 1 ? age + " yr" : age + " yrs";
    }

    // ================= MAP TO DTO =================
    private BookingResponseDTO mapToDTO(Booking booking) {
        LocalDate appointmentDate = parseDate(booking.getAppointmentDate());
        int age = calculateAgeAtDate(booking.getDob(), appointmentDate);
        ClinicDTO clinic = fetchClinic(booking.getClinicId());

        return BookingResponseDTO.builder()
                .bookingId(booking.getBookingId())
                .clinicId(booking.getClinicId())
                .clinicName(booking.getClinicName())
                .clinicAddress(booking.getClinicAddress())
                .hospitalLogo(clinic.getHospitalLogo())
                .customerId(booking.getCustomerId())
                .fullName(booking.getFullName())
                .city(booking.getCity())
                .dob(booking.getDob())
                .ageLabel(formatAge(age))
                .gender(booking.getGender())
                .serviceId(booking.getServiceId())
                .serviceName(booking.getServiceName())
                .serviceType(booking.getServiceType())
                .procedures(booking.getProcedures())
                .paymentMode(booking.getPaymentMode())
                .paymentType(booking.getPaymentType())
                .appointmentDate(booking.getAppointmentDate())
                .price(booking.getPrice())
                .discount(booking.getDiscount())
                .discountAmount(booking.getDiscountAmount())
                .discountedCost(booking.getDiscountedCost())
                .totalDiscountAmount(booking.getTotalDiscountAmount())
                .totalDiscountPercentage(booking.getTotalDiscountPercentage())
                .ngkDiscount(booking.getNgkDiscountAmount())
                .ngkDiscountPercentage(booking.getNgkDiscountPercentage())
                .taxPercentage(booking.getTaxPercentage())
                .taxAmount(booking.getTaxAmount())
                .gst(booking.getGst())
                .gstAmount(booking.getGstAmount())
                .consultationFee(booking.getConsultationFee())
                .platformFeePercentage(booking.getPlatformFeePercentage())
                .platformFee(booking.getPlatformFee())
                .finalAmount(booking.getFinalAmount())
                .partialPaymentPercentage(booking.getPartialPaymentPercentage())
                .partialAmount(booking.getPartialAmount())
                .dueAmount(booking.getDueAmount())
                .redeemedPoints(booking.getRedeemedPoints())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .mobileNumber(booking.getMobileNumber())
                .isRated(booking.isRated())
                .build();
    }

    // ================= CANCEL BOOKING =================
    @Override
    public BookingResponseDTO cancelBooking(CancelBookingDTO request) {
        Booking booking = bookingRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is already cancelled");
        }

        booking.setStatus("CANCELLED");

        // Refund only service amount; platform fee is non-refundable
        if ("PAID".equalsIgnoreCase(booking.getPaymentStatus())) {
            double refundableAmount = booking.getFinalAmount() - booking.getPlatformFee();
            if (refundableAmount > 0) {
                paymentService.refund(booking.getBookingId(), refundableAmount);
            }
        }

        booking.setPaymentStatus("NA");
        booking.setUpdatedAt(Instant.now().toString());
        bookingRepository.save(booking);

        return mapToDTO(booking);
    }

    // ================= RESCHEDULE BOOKING =================
    @Override
    public BookingResponseDTO rescheduleBooking(RescheduleBookingDTO request) {
        LocalDate newDate = LocalDate.parse(request.getNewAppointmentDate(), DateTimeFormatter.ISO_DATE);

        if (newDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New appointment date cannot be in the past");
        }

        Booking booking = bookingRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        booking.setAppointmentDate(request.getNewAppointmentDate());
        booking.setUpdatedAt(Instant.now().toString());
        bookingRepository.save(booking);

        return mapToDTO(booking);
    }

    // ================= GET CUSTOMER BOOKINGS =================
    @Override
    public List<BookingResponseDTO> getCustomerBookings(String customerId) {
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ================= GET CLINIC BOOKINGS =================
    @Override
    public List<BookingResponseDTO> getClinicBookings(String clinicId) {
        return bookingRepository.findByClinicIdOrderByCreatedAtDesc(clinicId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ================= UPDATE BOOKING STATUS =================
    @Override
    public BookingResponseDTO updateBookingStatus(UpdateBookingStatusDTO request) {
        Booking booking = bookingRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        String newStatus = request.getStatus().toUpperCase();

        if (!List.of("HOLD", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "FAILED").contains(newStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }

        booking.setStatus(newStatus);
        booking.setUpdatedAt(Instant.now().toString());
        bookingRepository.save(booking);

        return mapToDTO(booking);
    }

    // ================= RATE BOOKING =================
    @Override
    public RatingResponseDTO rateBooking(RatingDTO request) {
        Booking booking = bookingRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!"COMPLETED".equalsIgnoreCase(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is not completed yet");
        }

        if (booking.isRated()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking already rated");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }

        BookingRating rating = BookingRating.builder()
                .bookingId(booking.getBookingId())
                .customerId(booking.getCustomerId())
                .fullName(booking.getFullName())
                .mobileNumber(booking.getMobileNumber())
                .clinicId(booking.getClinicId())
                .clinicName(booking.getClinicName())
                .clinicAddress(booking.getClinicAddress())
                .serviceId(booking.getServiceId())
                .serviceName(booking.getServiceName())
                .serviceType(booking.getServiceType())
                .rating(request.getRating())
                .review(request.getReview())
                .createdAt(Instant.now().toString())
                .build();

        bookingRatingRepository.save(rating);

        booking.setRated(true);
        booking.setUpdatedAt(Instant.now().toString());
        bookingRepository.save(booking);

        return mapToRatingDTO(rating);
    }

    // ================= GET CLINIC RATINGS =================
    @Override
    public List<RatingResponseDTO> getClinicRatings(String clinicId) {
        return bookingRatingRepository.findByClinicId(clinicId)
                .stream()
                .map(this::mapToRatingDTO)
                .collect(Collectors.toList());
    }

    // ================= GET BOOKING RATING =================
    @Override
    public RatingResponseDTO getBookingRating(String bookingId) {
    	  BookingRating rating = bookingRatingRepository.findByBookingId(bookingId)
                  .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rating not found"));

          return mapToRatingDTO(rating);
      }


    // ================= GET CLINIC RATINGS WITH AVERAGE =================
    @Override
    public ClinicRatingsResponseDTO getClinicRatingsWithAverage(String clinicId) {
        List<RatingResponseDTO> ratings = bookingRatingRepository.findByClinicId(clinicId)
                .stream()
                .map(this::mapToRatingDTO)
                .collect(Collectors.toList());

        double averageRating = ratings.stream()
                .mapToInt(RatingResponseDTO::getRating)
                .average()
                .orElse(0.0);

        return ClinicRatingsResponseDTO.builder()
                .clinicId(clinicId)
                .averageRating(averageRating)
                .ratings(ratings)
                .build();
    }
    
 // ================= MAP BOOKING RATING TO DTO =================
    // ================= HELPER: MAP RATING =================
    private RatingResponseDTO mapToRatingDTO(BookingRating rating) {
        return RatingResponseDTO.builder()
                .bookingId(rating.getBookingId())
                .customerId(rating.getCustomerId())
                .fullName(rating.getFullName())
                .mobileNumber(rating.getMobileNumber())
                .clinicId(rating.getClinicId())
                .clinicName(rating.getClinicName())
                .clinicAddress(rating.getClinicAddress())
                .serviceId(rating.getServiceId())
                .serviceName(rating.getServiceName())
                .serviceType(rating.getServiceType())
                .rating(rating.getRating())
                .review(rating.getReview())
                .createdAt(rating.getCreatedAt())
                .build();
    }


}
