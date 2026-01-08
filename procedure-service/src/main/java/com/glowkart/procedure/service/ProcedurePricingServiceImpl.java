package com.glowkart.procedure.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

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

        pricings.forEach(p -> {
            // Treat null or blank offerValidDate as open-ended
            if (p.getOfferValidDate() == null || p.getOfferValidDate().isBlank()) {
                // Open-ended offer, recalc pricing
                processOfferAndPricing(p);
                return;
            }

            LocalDate endDate;
            try {
                endDate = LocalDate.parse(p.getOfferValidDate());
            } catch (DateTimeParseException e) {
                log.warn("Invalid offerValidDate for procedureId={}, clinicId={}", p.getProcedureId(), p.getClinicId());
                return;
            }

            if (!today.isAfter(endDate)) {
                // Offer still active
                processOfferAndPricing(p);
            } else {
                // Offer expired
                p.setOfferActive(false);

                // Only reset discount if offerValidDate is not blank (open-ended)
                if (!p.getOfferValidDate().isBlank()) {
                    p.setDiscountPercentage(0.0);
                    p.setDiscountAmount(0.0);
                }

                calculatePricing(p);
                p.setUpdatedAt(Instant.now());
                pricingRepository.save(p);
                log.info("Expired offer recalculated for procedureId={}, clinicId={}", p.getProcedureId(), p.getClinicId());
            }
        });
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
                    // Open-ended offer: active if today >= start
                    offerActive = !today.isBefore(start);
                } else {
                    LocalDate end = LocalDate.parse(p.getOfferValidDate());
                    offerActive = !today.isBefore(start) && !today.isAfter(end);
                }
            }
        } catch (DateTimeParseException e) {
            log.error("Invalid offer date for procedureId={}, clinicId={}: {}", 
                      p.getProcedureId(), p.getClinicId(), e.getMessage());
            offerActive = false;
        }

        p.setOfferActive(offerActive);

        // <-- UPDATE THIS BLOCK -->
        if (!offerActive && p.getOfferValidDate() != null && !p.getOfferValidDate().isBlank()) {
            p.setDiscountPercentage(0.0);
            p.setDiscountAmount(0.0);
        }

        // Always calculate pricing based on current offer status
        calculatePricing(p);
    }



    private void processOfferStatus(ProcedurePricing p) {
        LocalDate today = LocalDate.now(istZone);
        try {
            if (p.getOfferStart() == null) {
                p.setOfferActive(false);
                return;
            }

            LocalDate start = LocalDate.parse(p.getOfferStart());

            if (p.getOfferValidDate() == null || p.getOfferValidDate().isBlank()) {
                // No end date provided, offer is active if today >= start
                p.setOfferActive(!today.isBefore(start));
            } else {
                LocalDate end = LocalDate.parse(p.getOfferValidDate());
                p.setOfferActive(!today.isBefore(start) && !today.isAfter(end));
            }

        } catch (DateTimeParseException e) {
            log.error("Invalid offer date format: {}", e.getMessage());
            p.setOfferActive(false);
        }
    }


    private void resetDiscountIfExpired(ProcedurePricing p) {
        // Only reset discount if offer is inactive AND offer has a valid end date
        if (!p.isOfferActive() && p.getOfferValidDate() != null) {
            if (p.getDiscountPercentage() > 0) {
                p.setDiscountPercentage(0.0);
                p.setDiscountAmount(0.0);
            }
        }
        p.setTotalDiscountPercentage(p.getNgkDiscountPercentage());
        p.setTotalDiscountAmount(0.0);
    }

    private void calculatePricing(ProcedurePricing p) {

        double price = p.getPrice();

        double clinicDiscountPercent = p.getDiscountPercentage();
        double ngkDiscountPercent = p.getNgkDiscountPercentage();

        double clinicDiscountAmount = round(price * clinicDiscountPercent / 100.0);

        double discountedCost = p.isOfferActive()
                ? round(price - clinicDiscountAmount)
                : price;

        double taxAmount = round(discountedCost * p.getTaxPercentage() / 100.0);
        double gstAmount = round(discountedCost * p.getGst() / 100.0);

        double consultationFee = p.getConsultationFee();
        double clinicPay = round(discountedCost + taxAmount + gstAmount + consultationFee);

        double ngkDiscountAmount = (p.isOfferActive() && ngkDiscountPercent > 0)
                ? round(clinicPay * ngkDiscountPercent / 100.0)
                : 0.0;

        double finalCost = round(clinicPay - ngkDiscountAmount);

        double totalDiscountAmount = round(
                (p.isOfferActive() ? clinicDiscountAmount : 0.0) + ngkDiscountAmount
        );

        double totalDiscountPercent = p.isOfferActive()
                ? clinicDiscountPercent + ngkDiscountPercent
                : 0.0;

        // ✅ SET VALUES
        p.setDiscountAmount(clinicDiscountAmount);
        p.setDiscountedCost(discountedCost);
        p.setTaxAmount(taxAmount);
        p.setGstAmount(gstAmount);
        p.setClinicPay(clinicPay);
        p.setNgkDiscountAmount(ngkDiscountAmount);
        p.setFinalCost(finalCost);

        p.setTotalDiscountAmount(totalDiscountAmount);
        p.setTotalDiscountPercentage(totalDiscountPercent);

        // ✅ NEW FIELD
        p.setTotalDiscountedAmount(round(price - totalDiscountAmount));

        p.setUpdatedAt(Instant.now());
    }



//    private void calculatePricing(ProcedurePricing p) {
//        double price = p.getPrice();
//        double discountPercent = (p.isOfferActive() ? p.getDiscountPercentage() : 0.0);
//
//        double discountedPrice = round(price - (price * discountPercent / 100.0));
//        double taxAmount = round(discountedPrice * p.getTaxPercentage() / 100.0);
//        double gstAmount = round(discountedPrice * p.getGst() / 100.0);
//        double clinicPay = round(discountedPrice + taxAmount + gstAmount + p.getConsultationFee());
//        double ngkAmount = round(clinicPay * p.getNgkDiscountPercentage() / 100.0);
//        double finalCost = round(clinicPay - ngkAmount);
//
//        double discountAmount = price - discountedPrice;
//        double totalDiscountAmount = round(discountAmount + ngkAmount);
//        double totalDiscountPercent = discountPercent + p.getNgkDiscountPercentage();
//
//        p.setDiscountAmount(discountAmount);
//        p.setDiscountedCost(discountedPrice);
//        p.setTaxAmount(taxAmount);
//        p.setGstAmount(gstAmount);
//        p.setClinicPay(clinicPay);
//        p.setNgkDiscountAmount(ngkAmount);
//        p.setFinalCost(finalCost);
//        p.setTotalDiscountAmount(totalDiscountAmount);
//        p.setTotalDiscountPercentage(totalDiscountPercent);
//
//        p.setUpdatedAt(Instant.now());
//    }


    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // ========================= DTO FORMATTING =========================
    private ProcedurePricingDTO formatOfferDatesForResponse(ProcedurePricing p) {
        ProcedurePricingDTO dto = mapper.toDto(p);
        dto.setOfferStart(p.getOfferStart());
        dto.setOfferValidDate(p.getOfferValidDate());
        return dto;
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

            // No exception thrown if validDate is null — allows open-ended offers
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format for offerStart or offerValidDate. Expected yyyy-MM-dd");
        }
    }


    private LocalDate parseDateOrExisting(String dtoDate, String existingDate) {
        if (dtoDate != null && !dtoDate.isBlank()) return LocalDate.parse(dtoDate);
        if (existingDate != null && !existingDate.isBlank()) return LocalDate.parse(existingDate);
        return null;
    }
}
