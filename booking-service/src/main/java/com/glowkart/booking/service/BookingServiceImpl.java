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
        int pointsToApply = Math.min(request.getPointsToRedeem(), maxRedeemablePoints);

        double finalAmount = Math.max(originalAmount - pointsToApply, 0);

        return BookingPriceResponseDTO.builder()
                .originalFinalAmount(originalAmount)
                .availablePoints(availablePoints)
                .maxRedeemablePoints(maxRedeemablePoints)
                .appliedPoints(pointsToApply)
                .finalAmount(finalAmount)
                .build();
    }

    // ================= BOOKING CREATION =================
    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO request) {

        validateAppointmentDate(request.getAppointmentDate());

        CustomerDTO customer = fetchCustomer(request.getCustomerId());
        ClinicDTO clinic = fetchClinic(request.getClinicId());
        PricingDetails pricing = fetchPricingDetails(request.getServiceType(), request.getServiceId());

        List<BookingProcedureDTO> bookingProcedures =
                fetchBookingProcedures(request.getServiceType(), request.getServiceId());

        Booking booking = Booking.builder()
                .bookingId(UUID.randomUUID().toString())
                .customerId(customer.getCustomerId())
                .mobileNumber(customer.getMobile())
                .fullName(customer.getFullName())
                .city(customer.getCity())
                .dob(customer.getDob())
                .gender(customer.getGender())
                .clinicId(clinic.getClinicId())
                .clinicName(clinic.getName())
                .clinicAddress(clinic.getAddress())
                .serviceId(request.getServiceId())
                .serviceName(pricing.getServiceName())
                .serviceType(request.getServiceType())
                .paymentMode(request.getPaymentMode())
                .paymentType(request.getPaymentType())
                .appointmentDate(request.getAppointmentDate())
                .procedures(bookingProcedures)
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
                .finalAmount(pricing.getFinalAmount())
                .partialPaymentPercentage(pricing.getPartialPaymentPercentage())
                .partialAmount(pricing.getPartialAmount())
                .dueAmount(pricing.getDueAmount())
                .redeemedPoints(0)
                .status("HOLD")
                .paymentStatus("PENDING")
                .isRated(false)
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();

        bookingRepository.save(booking);

        int pointsToRedeem = validateWalletPoints(booking, request.getPointsToRedeem());
        boolean paymentSuccess = processPayment(booking);

        if (paymentSuccess && pointsToRedeem > 0) {
            walletService.redeemPoints(customer.getCustomerId(), pointsToRedeem);
            booking.setRedeemedPoints(pointsToRedeem);
            booking.setFinalAmount(Math.max(booking.getFinalAmount() - pointsToRedeem, 0));
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
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Requested points exceed maximum redeemable points"
            );
        }
        return requestedPoints;
    }

    // ================= PAYMENT =================
    private boolean processPayment(Booking booking) {

        if ("ONLINE".equalsIgnoreCase(booking.getPaymentMode())) {

            if ("FULL_PAYMENT".equalsIgnoreCase(booking.getPaymentType())) {
                boolean success = paymentService.pay(
                        booking.getBookingId(),
                        booking.getFinalAmount()
                );
                booking.setStatus(success ? "CONFIRMED" : "FAILED");
                booking.setPaymentStatus(success ? "PAID" : "FAILED");
                return success;
            }

            if ("PARTIAL_PAYMENT".equalsIgnoreCase(booking.getPaymentType())) {
                boolean success = paymentService.pay(
                        booking.getBookingId(),
                        booking.getPartialAmount()
                );
                booking.setStatus(success ? "CONFIRMED" : "FAILED");
                booking.setPaymentStatus(success ? "DUE" : "FAILED");
                return success;
            }
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
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Appointment date cannot be in the past"
            );
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
            ApiResponse<ProcedurePricingDTO> resp =
                    procedureClient.getPricingByProcedure(serviceId);
            if (resp == null || resp.getData() == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Procedure not found");
            }
            return resp.getData().getFinalCost();
        }

        if ("PACKAGE".equalsIgnoreCase(serviceType)) {
            ApiResponse<ProcedurePackageDTO> resp =
                    procedureClient.getPricingByPackage(serviceId);
            if (resp == null || resp.getData() == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Package not found");
            }
            return resp.getData().getFinalCost();
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid serviceType");
    }

    private PricingDetails fetchPricingDetails(String serviceType, String serviceId) {

        if ("PROCEDURE".equalsIgnoreCase(serviceType)) {
            ApiResponse<ProcedurePricingDTO> resp =
                    procedureClient.getPricingByProcedure(serviceId);
            if (resp == null || resp.getData() == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Procedure not found");
            }
            return PricingDetails.fromProcedurePricing(resp.getData());
        }

        if ("PACKAGE".equalsIgnoreCase(serviceType)) {
            ApiResponse<ProcedurePackageDTO> resp =
                    procedureClient.getPricingByPackage(serviceId);
            if (resp == null || resp.getData() == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Package not found");
            }
            return PricingDetails.fromPackagePricing(resp.getData());
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid serviceType");
    }

    private List<BookingProcedureDTO> fetchBookingProcedures(String serviceType, String serviceId) {

        if (!"PACKAGE".equalsIgnoreCase(serviceType)) return List.of();

        ApiResponse<ProcedurePackageDTO> resp =
                procedureClient.getPricingByPackage(serviceId);

        if (resp == null || resp.getData() == null || resp.getData().getProcedures() == null) {
            return List.of();
        }

        return resp.getData().getProcedures().stream()
                .map(p -> new BookingProcedureDTO(
                        p.getProcedureName(),
                        p.getNoOfSittings()
                ))
                .collect(Collectors.toList());
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        return LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE);
    }

    private int calculateAgeAtDate(LocalDate dob, LocalDate onDate) {
        if (dob == null || onDate == null || dob.isAfter(onDate)) return 0;
        return Period.between(dob, onDate).getYears();
    }

    private String formatAge(int age) {
        if (age <= 0) return "0 yrs";
        return age == 1 ? "1 yr" : age + " yrs";
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
                .paymentType(booking.getPaymentType())
                .paymentMode(booking.getPaymentMode())
                .appointmentDate(booking.getAppointmentDate())
                .price(booking.getPrice())
                .discount(booking.getDiscount())
                .discountAmount(booking.getDiscountAmount())
                .discountedCost(booking.getDiscountedCost())
                .totalDiscountAmount(booking.getTotalDiscountAmount())
                .totalDiscountPercentage(booking.getTotalDiscountPercentage())
                .ngkDiscount(booking.getNgkDiscountAmount())
                .ngkDiscountPercentage(booking.getNgkDiscountPercentage())
                .gst(booking.getGst())
                .gstAmount(booking.getGstAmount())
                .taxPercentage(booking.getTaxPercentage())
                .taxAmount(booking.getTaxAmount())
                .consultationFee(booking.getConsultationFee())
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

    // ================= CANCEL / RESCHEDULE / LIST =================
    @Override
    public BookingResponseDTO cancelBooking(CancelBookingDTO request) {

        Booking booking = bookingRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        booking.setStatus("CANCELLED");

        if ("PAID".equalsIgnoreCase(booking.getPaymentStatus())) {
            paymentService.refund(booking.getBookingId(), booking.getFinalAmount());
        }

        booking.setPaymentStatus("NA");
        booking.setUpdatedAt(Instant.now().toString());
        bookingRepository.save(booking);

        return mapToDTO(booking);
    }

    @Override
    public BookingResponseDTO rescheduleBooking(RescheduleBookingDTO request) {

        LocalDate newDate = LocalDate.parse(
                request.getNewAppointmentDate(),
                DateTimeFormatter.ISO_DATE
        );

        if (newDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "New appointment date cannot be in the past"
            );
        }

        Booking booking = bookingRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        booking.setAppointmentDate(request.getNewAppointmentDate());
        booking.setUpdatedAt(Instant.now().toString());
        bookingRepository.save(booking);

        return mapToDTO(booking);
    }

    @Override
    public List<BookingResponseDTO> getCustomerBookings(String customerId) {
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDTO> getClinicBookings(String clinicId) {
        return bookingRepository.findByClinicIdOrderByCreatedAtDesc(clinicId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO updateBookingStatus(UpdateBookingStatusDTO request) {

        Booking booking = bookingRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        String newStatus = request.getStatus().toUpperCase();

        if (!List.of(
                "HOLD", "CONFIRMED", "IN_PROGRESS",
                "COMPLETED", "CANCELLED", "FAILED"
        ).contains(newStatus)) {
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

    @Override
    public List<RatingResponseDTO> getClinicRatings(String clinicId) {
        return bookingRatingRepository.findByClinicId(clinicId)
                .stream()
                .map(this::mapToRatingDTO)
                .toList();
    }

    @Override
    public RatingResponseDTO getBookingRating(String bookingId) {

        BookingRating rating = bookingRatingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rating not found"));

        return mapToRatingDTO(rating);
    }

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

    @Override
    public ClinicRatingsResponseDTO getClinicRatingsWithAverage(String clinicId) {

        List<RatingResponseDTO> ratings = bookingRatingRepository.findByClinicId(clinicId)
                .stream()
                .map(this::mapToRatingDTO)
                .toList();

        double average = ratings.stream()
                .mapToInt(RatingResponseDTO::getRating)
                .average()
                .orElse(0.0);

        return ClinicRatingsResponseDTO.builder()
                .clinicId(clinicId)
                .averageRating(average)
                .ratings(ratings)
                .build();
    }
}
