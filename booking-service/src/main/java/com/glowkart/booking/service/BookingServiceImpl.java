package com.glowkart.booking.service;

import com.glowkart.booking.client.ClinicServiceClient;
import com.glowkart.booking.client.CustomerServiceClient;
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
    private final CustomerServiceClient customerClient;
    private final ProcedureServiceClient procedureClient;
    private final ClinicServiceClient clinicClient;
    private final PaymentService paymentService;

    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        log.info("Creating booking: customerId={}, serviceId={}, serviceType={}, paymentType={}",
                request.getCustomerId(), request.getServiceId(), request.getServiceType(), request.getPaymentType());

        // Validate appointment date
        LocalDate appointmentDate = LocalDate.parse(request.getAppointmentDate(), DateTimeFormatter.ISO_DATE);
        if (appointmentDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment date cannot be in the past");
        }

        // Fetch customer safely
        CustomerDTO customer = null;
        try {
            ApiResponse<CustomerDTO> customerResponse = customerClient.getCustomerId(request.getCustomerId());
            if (customerResponse == null || customerResponse.getData() == null || !customerResponse.isSuccess()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
            }
            customer = customerResponse.getData();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found", e);
        }

        // Fetch clinic safely
        ClinicDTO clinic = null;
        try {
            ApiResponse<ClinicDTO> clinicResponse = clinicClient.getClinicById(request.getClinicId());
            if (clinicResponse == null || clinicResponse.getData() == null || !clinicResponse.isSuccess()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Clinic not found");
            }
            clinic = clinicResponse.getData();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Clinic not found", e);
        }

        // Pricing variables
        String serviceName;
        double price, discountAmount, discountPercentage, discountedCost;
        double totalDiscountAmount, totalDiscountPercentage;
        double ngkDiscountAmount, ngkDiscountPercentage;
        double taxPercentage, taxAmount, gst, gstAmount, consultationFee, finalAmount;

        // Fetch pricing safely
        if ("PROCEDURE".equalsIgnoreCase(request.getServiceType())) {
            try {
                ApiResponse<ProcedurePricingDTO> pricingResponse = procedureClient.getPricingByProcedure(request.getServiceId());
                ProcedurePricingDTO pricing = (pricingResponse != null) ? pricingResponse.getData() : null;
                if (pricing == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Procedure not found");

                serviceName = pricing.getProcedureName();
                price = pricing.getPrice();
                discountAmount = pricing.getDiscountAmount();
                discountPercentage = (pricing.getDiscount() > 0) ? pricing.getDiscount() : (discountAmount / price) * 100;
                discountedCost = price - discountAmount;
                totalDiscountAmount = pricing.getTotalDiscountAmount();
                totalDiscountPercentage = pricing.getTotalDiscountPercentage();
                ngkDiscountAmount = pricing.getNgkDiscountAmount();
                ngkDiscountPercentage = pricing.getNgkDiscountPercentage();
                taxPercentage = pricing.getTaxPercentage();
                taxAmount = pricing.getTaxAmount();
                gst = pricing.getGst();
                gstAmount = pricing.getGstAmount();
                consultationFee = pricing.getConsultationFee();
                finalAmount = pricing.getFinalCost();
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Procedure not found", e);
            }

        } else if ("PACKAGE".equalsIgnoreCase(request.getServiceType())) {
            try {
                ApiResponse<ProcedurePackageDTO> pricingResponse = procedureClient.getPricingByPackage(request.getServiceId());
                ProcedurePackageDTO pricing = (pricingResponse != null) ? pricingResponse.getData() : null;
                if (pricing == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Package not found");

                serviceName = pricing.getPackageName();
                price = pricing.getPrice();
                discountAmount = 0;
                discountPercentage = 0;
                discountedCost = price;
                totalDiscountAmount = pricing.getTotalDiscountAmount();
                totalDiscountPercentage = pricing.getTotalDiscountPercentage();
                ngkDiscountAmount = 0;
                ngkDiscountPercentage = 0;
                taxPercentage = pricing.getTaxPercentage();
                taxAmount = pricing.getTaxAmount();
                gst = pricing.getGst();
                gstAmount = pricing.getGstAmount();
                consultationFee = pricing.getConsultationFee();
                finalAmount = pricing.getFinalCost();
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Package not found", e);
            }

        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid serviceType. Allowed: PROCEDURE, PACKAGE");
        }

        // Create booking
        Booking booking = Booking.builder()
                .bookingId(UUID.randomUUID().toString())
                .customerId(customer.getCustomerId())
                .mobileNumber(customer.getMobile())
                .clinicId(clinic.getClinicId())
                .clinicName(clinic.getName())
                .clinicAddress(clinic.getAddress())
                .serviceId(request.getServiceId())
                .serviceName(serviceName)
                .serviceType(request.getServiceType())
                .paymentType(request.getPaymentType())
                .appointmentDate(request.getAppointmentDate())
                .price(price)
                .discount(discountPercentage)
                .discountAmount(discountAmount)
                .discountedCost(discountedCost)
                .totalDiscountAmount(totalDiscountAmount)
                .totalDiscountPercentage(totalDiscountPercentage)
                .ngkDiscountAmount(ngkDiscountAmount)
                .ngkDiscountPercentage(ngkDiscountPercentage)
                .taxPercentage(taxPercentage)
                .taxAmount(taxAmount)
                .gst(gst)
                .gstAmount(gstAmount)
                .consultationFee(consultationFee)
                .finalAmount(finalAmount)
                .status("HOLD")
                .paymentStatus("PENDING")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        bookingRepository.save(booking);

        // Payment handling
        if ("ONLINE".equalsIgnoreCase(request.getPaymentType())) {
            boolean paymentSuccess = paymentService.pay(booking.getBookingId(), finalAmount);
            if (paymentSuccess) {
                booking.setStatus("CONFIRMED");
                booking.setPaymentStatus("PAID");
            } else {
                booking.setStatus("FAILED");
                booking.setPaymentStatus("FAILED");
            }
        } else if ("CASH".equalsIgnoreCase(request.getPaymentType())) {
            booking.setStatus("CONFIRMED");
            booking.setPaymentStatus("PENDING");
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid paymentType. Allowed: ONLINE, CASH");
        }

        booking.setUpdatedAt(Instant.now());
        bookingRepository.save(booking);

        return mapToDTO(booking);
    }


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
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .mobileNumber(booking.getMobileNumber())
                .build();
    }
}
