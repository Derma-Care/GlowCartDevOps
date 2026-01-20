package com.glowkart.procedure.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.glowkart.procedure.client.ClinicFeignClient;
import com.glowkart.procedure.dto.ProcedureOfferDTO;
import com.glowkart.procedure.dto.ProcedurePricingDTO;
import com.glowkart.procedure.exception.DuplicateResourceException;
import com.glowkart.procedure.exception.ResourceNotFoundException;
import com.glowkart.procedure.mapper.ProcedurePricingMapper;
import com.glowkart.procedure.model.Procedure;
import com.glowkart.procedure.model.ProcedurePricing;
import com.glowkart.procedure.repo.ProcedurePricingRepository;
import com.glowkart.procedure.repo.ProcedureRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcedurePricingServiceImpl implements ProcedurePricingService {

    private final ProcedurePricingRepository pricingRepository;
    private final ProcedureRepository procedureRepository;
    private final ProcedurePricingMapper mapper;
    private final ClinicFeignClient clinicFeignClient;

    private final ZoneId istZone = ZoneId.of("Asia/Kolkata");

    // ---------------- Dynamic Platform Fee ----------------
    @Value("${glowkart.platform.fee-percentage:2.0}")
    private double platformFeePercentage;

    // ========================= CREATE =========================
    @Override
    @Transactional
    public ProcedurePricingDTO create(ProcedurePricingDTO dto) {
        validateDiscountAndOffer(dto, null);
        validateClinic(dto.getClinicId());

        Procedure procedure = procedureRepository.findById(dto.getProcedureId())
                .orElseThrow(() -> new ResourceNotFoundException("PROC_NOT_FOUND",
                        "Procedure not found with ID: " + dto.getProcedureId()));

        if (pricingRepository.existsByProcedureIdAndClinicId(dto.getProcedureId(), dto.getClinicId())) {
            throw new DuplicateResourceException("DUPLICATE_PRICING",
                    "Pricing already exists for this procedure and clinic.");
        }

        ProcedurePricing entity = mapper.toEntity(dto);
        entity.setProcedureName(procedure.getProcedureName());
        Instant now = Instant.now();
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);

        normalizeOfferDates(entity);
        processOfferAndPricing(entity);

        pricingRepository.save(entity);
        return formatOfferDatesForResponse(entity);
    }

    // ========================= UPDATE =========================
    @Override
    @Transactional
    public ProcedurePricingDTO update(String procedureId, String clinicId, ProcedurePricingDTO dto) {
        validateClinic(clinicId);

        ProcedurePricing existing = pricingRepository.findByProcedureIdAndClinicId(procedureId, clinicId)
                .orElseThrow(() -> new ResourceNotFoundException("PRICING_NOT_FOUND",
                        "Procedure pricing not found for procedure ID " + procedureId));

        if (dto.getProcedureId() != null && !dto.getProcedureId().equals(existing.getProcedureId())) {
            Procedure procedure = procedureRepository.findById(dto.getProcedureId())
                    .orElseThrow(() -> new ResourceNotFoundException("PROC_NOT_FOUND",
                            "Procedure not found with ID: " + dto.getProcedureId()));
            existing.setProcedureId(procedure.getId());
            existing.setProcedureName(procedure.getProcedureName());
        }

        validateDiscountAndOffer(dto, existing);

        mapper.updateEntity(existing, dto);
        existing.setUpdatedAt(Instant.now());

        normalizeOfferDates(existing);
        processOfferAndPricing(existing);

        pricingRepository.save(existing);
        return formatOfferDatesForResponse(existing);
    }

    // ========================= SCHEDULED TASK TO EXPIRE OFFERS =========================
    @Scheduled(cron = "0 1 0 * * *", zone = "Asia/Kolkata")
    @Transactional
    public void expireOffers() {
        LocalDate today = LocalDate.now(istZone);

        List<ProcedurePricing> pricings = pricingRepository.findAll();

        for (ProcedurePricing p : pricings) {
            boolean offerExpired = false;

            if (p.getOfferValidDate() != null && !p.getOfferValidDate().isBlank()) {
                try {
                    LocalDate endDate = LocalDate.parse(p.getOfferValidDate());
                    if (today.isAfter(endDate)) offerExpired = true;
                } catch (DateTimeParseException e) {
                    log.warn("Invalid offerValidDate for procedureId={}, clinicId={}", p.getProcedureId(), p.getClinicId());
                }
            }

            if (offerExpired) {
                p.setOfferActive(false);
                p.setDiscountPercentage(0.0);
                p.setDiscountAmount(0.0);
            }

            processOfferAndPricing(p);
            p.setUpdatedAt(Instant.now());
            pricingRepository.save(p);
        }
    }

    // ========================= OFFER DATE NORMALIZATION =========================
    private void normalizeOfferDates(ProcedurePricing p) {
        if (p.getOfferStart() != null) p.setOfferStart(p.getOfferStart().trim());
        if (p.getOfferValidDate() != null) p.setOfferValidDate(p.getOfferValidDate().trim());
    }

    // ========================= OFFER + PRICING PROCESS =========================
    private void processOfferAndPricing(ProcedurePricing p) {
        LocalDate today = LocalDate.now(istZone);

        boolean offerActive = false;
        try {
            if (p.getOfferStart() != null && !p.getOfferStart().isBlank()) {
                LocalDate start = LocalDate.parse(p.getOfferStart());

                if (p.getOfferValidDate() == null || p.getOfferValidDate().isBlank()) {
                    offerActive = !today.isBefore(start);
                } else {
                    LocalDate end = LocalDate.parse(p.getOfferValidDate());
                    offerActive = !today.isBefore(start) && !today.isAfter(end);
                }
            }
        } catch (DateTimeParseException e) {
            log.error("Invalid offer date for procedureId={}, clinicId={}: {}", 
                      p.getProcedureId(), p.getClinicId(), e.getMessage());
        }

        p.setOfferActive(offerActive);

        if (!offerActive && p.getOfferValidDate() != null && !p.getOfferValidDate().isBlank()) {
            p.setDiscountPercentage(0.0);
            p.setDiscountAmount(0.0);
        }

        calculatePricing(p);
    }

    // ========================= PRICING CALCULATION =========================
    private void calculatePricing(ProcedurePricing p) {
        double price = p.getPrice();
        double clinicDiscountPercent = p.getDiscountPercentage();
        double ngkDiscountPercent = p.getNgkDiscountPercentage();

        // ---------------- CLINIC DISCOUNT ----------------
        double clinicDiscountAmount = p.isOfferActive()
                ? round(price * clinicDiscountPercent / 100.0)
                : 0.0;

        double discountedCost = p.isOfferActive()
                ? round(price - clinicDiscountAmount)
                : round(price);

        // ---------------- TAX & GST ----------------
        double taxAmount = round(discountedCost * p.getTaxPercentage() / 100.0);
        double gstAmount = round(discountedCost * p.getGst() / 100.0);

        double consultationFee = p.getConsultationFee();
        double clinicPay = round(discountedCost + taxAmount + gstAmount + consultationFee);

        // ---------------- NGK DISCOUNT ----------------
        double ngkDiscountAmount = (p.isOfferActive() && ngkDiscountPercent > 0)
                ? round(clinicPay * ngkDiscountPercent / 100.0)
                : 0.0;

        // ---------------- FINAL COST ----------------
        double finalCost = round(clinicPay - ngkDiscountAmount);

        // ---------------- TOTAL DISCOUNT ----------------
        double totalDiscountAmount = round(clinicDiscountAmount + ngkDiscountAmount);
        double totalDiscountPercent = p.isOfferActive() ? clinicDiscountPercent + ngkDiscountPercent : 0.0;

        p.setDiscountAmount(clinicDiscountAmount);
        p.setDiscountedCost(discountedCost);
        p.setTaxAmount(taxAmount);
        p.setGstAmount(gstAmount);
        p.setClinicPay(clinicPay);
        p.setNgkDiscountAmount(ngkDiscountAmount);
        p.setFinalCost(finalCost);
        p.setTotalDiscountAmount(totalDiscountAmount);
        p.setTotalDiscountPercentage(totalDiscountPercent);
        p.setTotalDiscountedAmount(round(price - totalDiscountAmount));

        calculatePaymentAmounts(p);

        p.setUpdatedAt(Instant.now());
    }


    private double calculatePlatformFee(double price) {
        return round(price * platformFeePercentage / 100.0);
    }

    private void calculatePaymentAmounts(ProcedurePricing p) {
        double finalCost = p.getFinalCost();
        String paymentType = p.getPaymentType();

        if (paymentType == null || paymentType.isBlank() || paymentType.equalsIgnoreCase("FULL_PAYMENT")) {
            p.setPartialAmount(round(finalCost));
            p.setDueAmount(0.0);
        } else if (paymentType.equalsIgnoreCase("PARTIAL_PAYMENT")) {
            double percentage = p.getPartialPaymentPercentage();
            if (percentage <= 0 || percentage > 100) throw new IllegalArgumentException("partialPaymentPercentage must be between 1 and 100");

            double partialAmount = round(finalCost * percentage / 100.0);
            double dueAmount = round(finalCost - partialAmount);

            p.setPartialAmount(partialAmount);
            p.setDueAmount(dueAmount);
        } else {
            throw new IllegalArgumentException("Invalid paymentType: " + paymentType);
        }
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // ========================= READ METHODS =========================
    @Override
    @Transactional
    public List<ProcedurePricingDTO> getAll() {
        return pricingRepository.findAll().stream()
                .peek(this::processOfferAndPricing)
                .map(this::formatOfferDatesForResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<ProcedurePricingDTO> getByClinic(String clinicId) {
        validateClinic(clinicId);
        return pricingRepository.findByClinicId(clinicId).stream()
                .peek(this::processOfferAndPricing)
                .map(this::formatOfferDatesForResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProcedurePricingDTO getByProcedureId(String procedureId) {
        ProcedurePricing maxDiscountPricing = pricingRepository.findByProcedureId(procedureId).stream()
                .peek(this::processOfferAndPricing)
                .max(Comparator.comparingDouble(ProcedurePricing::getTotalDiscountPercentage))
                .orElseThrow(() -> new ResourceNotFoundException("PRICING_NOT_FOUND", "No pricing found"));

        return formatOfferDatesForResponse(maxDiscountPricing);
    }

    @Override
    public List<ProcedureOfferDTO> getProcedureOffers() {
        List<ProcedurePricing> allPricings = pricingRepository.findAll();
        Map<String, ProcedureOfferDTO> offerMap = new HashMap<>();
        LocalDate today = LocalDate.now(istZone);

        for (ProcedurePricing p : allPricings) {
            boolean offerActive = false;
            if (p.getOfferStart() != null && p.getOfferValidDate() != null) {
                try {
                    LocalDate start = LocalDate.parse(p.getOfferStart());
                    LocalDate end = LocalDate.parse(p.getOfferValidDate());
                    offerActive = !today.isBefore(start) && !today.isAfter(end);
                } catch (DateTimeParseException e) {
                    log.warn("Invalid offer date for procedureId={}, clinicId={}", p.getProcedureId(), p.getClinicId());
                }
            }

            double discountPercent = (offerActive ? p.getDiscountPercentage() : 0.0) + p.getNgkDiscountPercentage();
            int discount = (int) discountPercent;

            String procedureId = p.getProcedureId();
            offerMap.compute(procedureId, (k, v) -> {
                if (v == null) return new ProcedureOfferDTO(procedureId, p.getProcedureName(), discount, discount);
                v.setMinOffer(Math.min(v.getMinOffer(), discount));
                v.setMaxOffer(Math.max(v.getMaxOffer(), discount));
                return v;
            });
        }

        return new ArrayList<>(offerMap.values());
    }

    @Override
    public List<String> getClinicIdsByProcedure(String procedureId) {
        return pricingRepository.findByProcedureId(procedureId).stream()
                .map(ProcedurePricing::getClinicId)
                .distinct()
                .toList();
    }

    @Override
    @Transactional
    public void delete(String procedureId, String clinicId) {
        validateClinic(clinicId);
        ProcedurePricing existing = pricingRepository.findByProcedureIdAndClinicId(procedureId, clinicId)
                .orElseThrow(() -> new ResourceNotFoundException("PRICING_NOT_FOUND", "Procedure pricing not found"));
        pricingRepository.delete(existing);
    }

    @Override
    public ProcedurePricingDTO getByProcedureAndClinic(String procedureId, String clinicId) {
        validateClinic(clinicId);

        ProcedurePricing maxDiscountPricing = pricingRepository.findByClinicId(clinicId).stream()
                .filter(p -> p.getProcedureId().equals(procedureId))
                .peek(this::processOfferAndPricing)
                .max(Comparator.comparingDouble(ProcedurePricing::getTotalDiscountPercentage))
                .orElseThrow(() -> new ResourceNotFoundException("PRICING_NOT_FOUND", "No pricing found"));

        return formatOfferDatesForResponse(maxDiscountPricing);
    }

    // ========================= VALIDATIONS =========================
    private void validateClinic(String clinicId) {
        try {
            clinicFeignClient.getClinicById(clinicId);
        } catch (Exception e) {
            throw new ResourceNotFoundException("CLINIC_NOT_FOUND", "Clinic not found with ID: " + clinicId);
        }
    }

    private void validateDiscountAndOffer(ProcedurePricingDTO dto, ProcedurePricing existing) {
        validateDiscount(dto);
        validateOfferDates(dto, existing);
    }

    private void validateDiscount(ProcedurePricingDTO dto) {
        Double discount = dto.getDiscountPercentage();
        String offerStart = dto.getOfferStart();

        boolean hasDiscount = discount != null && discount > 0;
        boolean hasOfferStart = offerStart != null && !offerStart.isBlank();

        if (hasOfferStart && !hasDiscount)
            throw new IllegalArgumentException("discountPercentage is required when offerStart is provided");
        if (hasDiscount && !hasOfferStart)
            throw new IllegalArgumentException("offerStart is required when discountPercentage > 0");
    }

    private void validateOfferDates(ProcedurePricingDTO dto, ProcedurePricing existing) {
        LocalDate today = LocalDate.now(istZone);
        try {
            LocalDate startDate = parseDateOrExisting(dto.getOfferStart(), existing != null ? existing.getOfferStart() : null);
            LocalDate validDate = parseDateOrExisting(dto.getOfferValidDate(), existing != null ? existing.getOfferValidDate() : null);

            if (startDate != null && startDate.isBefore(today))
                throw new IllegalArgumentException("offerStart cannot be in the past");

            if (validDate != null && validDate.isBefore(today))
                throw new IllegalArgumentException("offerValidDate cannot be in the past");

            if (startDate != null && validDate != null && validDate.isBefore(startDate))
                throw new IllegalArgumentException("offerValidDate cannot be before offerStart");

        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format for offerStart or offerValidDate. Expected yyyy-MM-dd");
        }
    }

    private LocalDate parseDateOrExisting(String dtoDate, String existingDate) {
        if (dtoDate != null && !dtoDate.isBlank()) return LocalDate.parse(dtoDate);
        if (existingDate != null && !existingDate.isBlank()) return LocalDate.parse(existingDate);
        return null;
    }

    private ProcedurePricingDTO formatOfferDatesForResponse(ProcedurePricing p) {
        ProcedurePricingDTO dto = mapper.toDto(p);

        dto.setOfferStart(p.getOfferStart());
        dto.setOfferValidDate(p.getOfferValidDate());

        // dynamically calculate platform fee
        double platformFee = round(p.getPrice() * platformFeePercentage / 100.0);
        dto.setPlatformFee(platformFee);

        // include the percentage itself
        dto.setPlatformFeePercentage(platformFeePercentage);

        return dto;
    }


}
