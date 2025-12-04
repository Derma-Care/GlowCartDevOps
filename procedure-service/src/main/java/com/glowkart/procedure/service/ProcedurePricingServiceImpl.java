package com.glowkart.procedure.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.glowkart.procedure.client.ClinicFeignClient;
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

    @Override
    @Transactional
    public ProcedurePricingDTO create(ProcedurePricingDTO dto) {

        validateDiscountAndOffer(dto);
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
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        setOfferActive(entity);
        calculatePricing(entity);

        return mapper.toDto(pricingRepository.save(entity));
    }

    @Override
    public List<ProcedurePricingDTO> getByClinic(String clinicId) {
        validateClinic(clinicId);

        return pricingRepository.findByClinicId(clinicId).stream()
                .map(this::setOfferActive)
                .map(this::calculatePricing)
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProcedurePricingDTO getByProcedureAndClinic(String procedureId, String clinicId) {
        validateClinic(clinicId);

        List<ProcedurePricing> pricings = pricingRepository.findByClinicId(clinicId).stream()
                .filter(p -> p.getProcedureId().equals(procedureId))
                .toList();

        if (pricings.isEmpty()) {
            throw new ResourceNotFoundException("PRICING_NOT_FOUND",
                    "No pricing found for procedure ID " + procedureId + " in clinic " + clinicId);
        }

        ProcedurePricing best = pricings.stream()
                .map(this::setOfferActive)
                .max(Comparator.comparingDouble(p -> p.isOfferActive() ? p.getDiscountPercentage() : 0))
                .orElse(pricings.get(0));

        calculatePricing(best);

        return mapper.toDto(best);
    }

    @Override
    @Transactional
    public ProcedurePricingDTO update(String procedureId, String clinicId, ProcedurePricingDTO dto) {

        validateDiscountAndOffer(dto);
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

        mapper.updateEntity(existing, dto);
        existing.setUpdatedAt(Instant.now());

        setOfferActive(existing);
        calculatePricing(existing);

        return mapper.toDto(pricingRepository.save(existing));
    }

    @Override
    @Transactional
    public void delete(String procedureId, String clinicId) {
        validateClinic(clinicId);

        ProcedurePricing existing = pricingRepository.findByProcedureIdAndClinicId(procedureId, clinicId)
                .orElseThrow(() -> new ResourceNotFoundException("PRICING_NOT_FOUND",
                        "Procedure pricing not found for procedure ID " + procedureId));

        pricingRepository.delete(existing);
    }

    @Override
    public List<ProcedurePricingDTO> getAll() {
        return pricingRepository.findAll().stream()
                .map(this::setOfferActive)
                .map(this::calculatePricing)
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    // ------------------ VALIDATIONS ------------------

    private void validateClinic(String clinicId) {
        try {
            clinicFeignClient.getClinicById(clinicId);
        } catch (Exception e) {
            throw new ResourceNotFoundException("CLINIC_NOT_FOUND",
                    "Clinic not found with ID: " + clinicId);
        }
    }

    /** NEW LOGIC */
    private void validateDiscountAndOffer(ProcedurePricingDTO dto) {

        Double discount = dto.getDiscountPercentage();
        String offerStart = dto.getOfferStart();

        boolean hasDiscount = discount != null && discount > 0;
        boolean hasOfferStart = offerStart != null && !offerStart.isBlank();

        // CASE 1: offerStart exists but discount is missing or 0
        if (hasOfferStart && !hasDiscount) {
            throw new IllegalArgumentException("discountPercentage is required when offerStart is provided");
        }

        // CASE 2: discount exists but offerStart missing
        if (hasDiscount && !hasOfferStart) {
            throw new IllegalArgumentException("offerStart is required when discountPercentage > 0");
        }

        // CASE 3: both missing → OK
        // CASE 4: both present → OK
    }


    // ------------------ OFFER LOGIC ------------------

    private ProcedurePricing setOfferActive(ProcedurePricing p) {

        Instant now = Instant.now();

        try {
            if (p.getOfferStart() == null || p.getOfferStart().isBlank()) {
                p.setOfferActive(false);
                return p;
            }

            Instant start = Instant.parse(p.getOfferStart());

            if (p.getOfferValidDate() == null || p.getOfferValidDate().isBlank()) {
                p.setOfferActive(!now.isBefore(start));
                return p;
            }

            Instant end = Instant.parse(p.getOfferValidDate());
            p.setOfferActive(!now.isBefore(start) && !now.isAfter(end));

        } catch (Exception e) {
            p.setOfferActive(false);
        }

        return p;
    }

    // ------------------ PRICING CALCULATION ------------------

    private ProcedurePricing calculatePricing(ProcedurePricing procedure) {

        double price = procedure.getPrice();
        double discountPercent = procedure.isOfferActive() ? procedure.getDiscountPercentage() : 0;

        double discountAmount = price * discountPercent / 100.0;
        double discountedPrice = price - discountAmount;

        double taxAmount = discountedPrice * procedure.getTaxPercentage() / 100.0;
        double gstAmount = discountedPrice * procedure.getGst() / 100.0;

        double clinicPay = discountedPrice + taxAmount + gstAmount;
        double finalCost = discountedPrice +
                procedure.getConsultationFee() +
                taxAmount +
                gstAmount;

        procedure.setDiscountAmount(discountAmount);
        procedure.setDiscountedCost(discountedPrice);
        procedure.setTaxAmount(taxAmount);
        procedure.setGstAmount(gstAmount);
        procedure.setClinicPay(clinicPay);
        procedure.setFinalCost(finalCost);

        return procedure;
    }

    @Override
    public ProcedurePricingDTO getByProcedureId(String procedureId) {

        // Fetch procedure entity to ensure it exists
        Procedure procedure = procedureRepository.findById(procedureId)
                .orElseThrow(() -> new ResourceNotFoundException("PROC_NOT_FOUND",
                        "Procedure not found with ID: " + procedureId));

        // Fetch all pricing entries for this procedure across clinics
        List<ProcedurePricing> pricings = pricingRepository.findByProcedureId(procedureId);

        if (pricings.isEmpty()) {
            throw new ResourceNotFoundException("PRICING_NOT_FOUND",
                    "No pricing found for procedure ID " + procedureId);
        }

        // Choose the best offer if multiple entries exist
        ProcedurePricing best = pricings.stream()
                .map(this::setOfferActive)
                .max(Comparator.comparingDouble(p -> p.isOfferActive() ? p.getDiscountPercentage() : 0))
                .orElse(pricings.get(0));

        calculatePricing(best);

        return mapper.toDto(best);
    }

}
