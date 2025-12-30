package com.glowkart.booking.service;

import com.glowkart.booking.client.ClinicServiceClient;
import com.glowkart.booking.client.CustomerInfoClient;
import com.glowkart.booking.client.ProcedureServiceClient;
import com.glowkart.booking.dto.*;
import com.glowkart.booking.model.Booking;
import com.glowkart.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final CustomerInfoClient customerInfoClient;
    private final ProcedureServiceClient procedureClient;
    private final ClinicServiceClient clinicClient;
    private final PaymentService paymentService;
    private final WalletService walletService;

    // ================= Price Calculation API =================
    @Override
    public BookingPriceResponseDTO calculateFinalAmountWithPoints(BookingPriceRequestDTO request) {
        double originalAmount = fetchServiceFinalCost(request.getServiceType(), request.getServiceId());
        CustomerDTO customer = fetchCustomer(request.getCustomerId());

        int availablePoints = walletService.getWalletSummary(customer.getMobile()).getBalance();
        int maxRedeemablePoints = availablePoints / 2;
        int pointsToApply = Math.min(request.getPointsToRedeem(), maxRedeemablePoints);

        double discountedAmount = Math.max(originalAmount - pointsToApply, 0);

        return BookingPriceResponseDTO.builder()
                .originalFinalAmount(originalAmount)
                .appliedPoints(pointsToApply)
                .finalAmount(discountedAmount)
                .build();
    }

    // ================= Booking Creation API =================
    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        log.info("Creating booking: customerId={}, serviceId={}, serviceType={}, paymentType={}, pointsToRedeem={}",
                request.getCustomerId(), request.getServiceId(), request.getServiceType(),
                request.getPaymentType(), request.getPointsToRedeem());

        validateAppointmentDate(request.getAppointmentDate());
        CustomerDTO customer = fetchCustomer(request.getCustomerId());
        ClinicDTO clinic = fetchClinic(request.getClinicId());

        PricingDetails pricing = fetchPricingDetails(request.getServiceType(), request.getServiceId());

        Booking booking = Booking.builder()
                .bookingId(UUID.randomUUID().toString())
                .customerId(customer.getCustomerId())
                .mobileNumber(customer.getMobile())
                .clinicId(clinic.getClinicId())
                .clinicName(clinic.getName())
                .clinicAddress(clinic.getAddress())
                .serviceId(request.getServiceId())
                .serviceName(pricing.getServiceName())
                .serviceType(request.getServiceType())
                .paymentType(request.getPaymentType())
                .appointmentDate(request.getAppointmentDate())
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
                .redeemedPoints(0)
                .status("HOLD")
                .paymentStatus("PENDING")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();


        bookingRepository.save(booking);

        // ===== Redeem points if requested =====
        applyWalletPoints(booking, customer.getCustomerId(), request.getPointsToRedeem());

        // ===== Payment Handling =====
        processPayment(booking);

        booking.setUpdatedAt(Instant.now());
        bookingRepository.save(booking);

        return mapToDTO(booking);
    }

    // ================= Helpers =================
    private void validateAppointmentDate(String date) {
        LocalDate appointmentDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
        if (appointmentDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment date cannot be in the past");
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
            ApiResponse<ProcedurePricingDTO> resp = procedureClient.getPricingByProcedure(serviceId);
            ProcedurePricingDTO p = resp != null ? resp.getData() : null;
            if (p == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Procedure not found");
            return p.getFinalCost();
        } else if ("PACKAGE".equalsIgnoreCase(serviceType)) {
            ApiResponse<ProcedurePackageDTO> resp = procedureClient.getPricingByPackage(serviceId);
            ProcedurePackageDTO p = resp != null ? resp.getData() : null;
            if (p == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Package not found");
            return p.getFinalCost();
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid serviceType");
        }
    }

    private PricingDetails fetchPricingDetails(String serviceType, String serviceId) {
        if ("PROCEDURE".equalsIgnoreCase(serviceType)) {
            ApiResponse<ProcedurePricingDTO> resp = procedureClient.getPricingByProcedure(serviceId);
            ProcedurePricingDTO p = resp != null ? resp.getData() : null;
            if (p == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Procedure not found");

            return PricingDetails.fromProcedurePricing(p);

        } else if ("PACKAGE".equalsIgnoreCase(serviceType)) {
            ApiResponse<ProcedurePackageDTO> resp = procedureClient.getPricingByPackage(serviceId);
            ProcedurePackageDTO p = resp != null ? resp.getData() : null;
            if (p == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Package not found");

            return PricingDetails.fromPackagePricing(p);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid serviceType");
        }
    }

    private void applyWalletPoints(Booking booking, String customerId, int requestedPoints) {
        int availablePoints = walletService.getWalletSummary(booking.getMobileNumber()).getBalance();
        int maxRedeemablePoints = availablePoints / 2;
        int pointsToApply = Math.min(requestedPoints, maxRedeemablePoints);

        if (pointsToApply > 0) {
            walletService.redeemPoints(customerId, pointsToApply);
            double updatedAmount = Math.max(booking.getFinalAmount() - pointsToApply, 0);
            booking.setRedeemedPoints(pointsToApply);
            booking.setFinalAmount(updatedAmount);
            bookingRepository.save(booking);
        }
    }

    private void processPayment(Booking booking) {
        if ("ONLINE".equalsIgnoreCase(booking.getPaymentType())) {
            boolean success = paymentService.pay(booking.getBookingId(), booking.getFinalAmount());
            if (success) {
                booking.setStatus("CONFIRMED");
                booking.setPaymentStatus("PAID");
            } else {
                booking.setStatus("FAILED");
                booking.setPaymentStatus("FAILED");
            }
        } else if ("CASH".equalsIgnoreCase(booking.getPaymentType())) {
            booking.setStatus("CONFIRMED");
            booking.setPaymentStatus("PENDING");
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid paymentType");
        }
    }

    // ================= Map Booking to DTO =================
    private BookingResponseDTO mapToDTO(Booking booking) {
        return BookingResponseDTO.builder()
                .bookingId(booking.getBookingId())
                .clinicName(booking.getClinicName())
                .clinicAddress(booking.getClinicAddress())
                .serviceId(booking.getServiceId())
                .serviceName(booking.getServiceName())
                .serviceType(booking.getServiceType())
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
                .gst(booking.getGst())
                .gstAmount(booking.getGstAmount())
                .taxPercentage(booking.getTaxPercentage())
                .taxAmount(booking.getTaxAmount())
                .consultationFee(booking.getConsultationFee())
                .finalAmount(booking.getFinalAmount())
                .redeemedPoints(booking.getRedeemedPoints())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .mobileNumber(booking.getMobileNumber())
                .build();
    }

    // ================= Cancel / Reschedule / List =================
    @Override
    public BookingResponseDTO cancelBooking(CancelBookingDTO request) {
        Booking booking = bookingRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        booking.setStatus("CANCELLED");
        if ("PAID".equals(booking.getPaymentStatus())) {
            paymentService.refund(booking.getBookingId(), booking.getFinalAmount());
        }
        booking.setPaymentStatus("NA");
        booking.setUpdatedAt(Instant.now());
        bookingRepository.save(booking);

        return mapToDTO(booking);
    }

    @Override
    public BookingResponseDTO rescheduleBooking(RescheduleBookingDTO request) {
        LocalDate newDate = LocalDate.parse(request.getNewAppointmentDate(), DateTimeFormatter.ISO_DATE);
        if (newDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New appointment date cannot be in the past");
        }

        Booking booking = bookingRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        booking.setAppointmentDate(request.getNewAppointmentDate());
        booking.setUpdatedAt(Instant.now());
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
}
