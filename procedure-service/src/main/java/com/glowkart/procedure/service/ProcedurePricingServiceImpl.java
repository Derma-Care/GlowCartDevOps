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
        log.info("Creating pricing for procedureId={} and clinicId={}", dto.getProcedureId(), dto.getClinicId());

        Procedure procedure = procedureRepository.findById(dto.getProcedureId())
                .orElseThrow(() -> new ResourceNotFoundException("PROC_NOT_FOUND",
                        "Procedure not found with ID: " + dto.getProcedureId()));

        validateClinic(dto.getClinicId());

        pricingRepository.findByProcedureIdAndClinicId(dto.getProcedureId(), dto.getClinicId())
                .ifPresent(existing -> {
                    String name = existing.getProcedureName() != null ? existing.getProcedureName() : "Unknown";
                    throw new DuplicateResourceException("DUPLICATE_PRICING",
                            "Procedure '" + name + "' already has pricing set for this clinic.");
                });

        ProcedurePricing entity = mapper.toEntity(dto);
        entity.setProcedureName(procedure.getProcedureName());
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        setOfferActive(entity);
        calculatePricing(entity);

        ProcedurePricing saved = pricingRepository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public List<ProcedurePricingDTO> getByClinic(String clinicId) {
        validateClinic(clinicId);
        // Fetch all pricings for the clinic, refresh offer and pricing dynamically
        return pricingRepository.findByClinicId(clinicId).stream()
                .map(this::setOfferActive)      // refresh offerActive based on current time
                .map(this::calculatePricing)    // recalculate all pricing fields
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProcedurePricingDTO getByProcedureAndClinic(String procedureId, String clinicId) {
        validateClinic(clinicId);

        List<ProcedurePricing> pricings = pricingRepository.findByClinicId(clinicId).stream()
                .filter(p -> p.getProcedureId().equals(procedureId))
                .collect(Collectors.toList());

        if (pricings.isEmpty()) {
            throw new ResourceNotFoundException("PRICING_NOT_FOUND",
                    "No pricing found for procedure ID " + procedureId + " in clinic " + clinicId);
        }

        // Pick the pricing with highest active discount
        ProcedurePricing bestOffer = pricings.stream()
                .map(this::setOfferActive)      // refresh offerActive
                .max(Comparator.comparingDouble(p -> p.isOfferActive() ? p.getDiscountPercentage() : 0))
                .orElse(pricings.get(0));

        calculatePricing(bestOffer);            // recalculate pricing fields
        return mapper.toDto(bestOffer);
    }


    @Override
    @Transactional
    public ProcedurePricingDTO update(String procedureId, String clinicId, ProcedurePricingDTO dto) {
        validateClinic(clinicId);

        ProcedurePricing existing = pricingRepository.findByProcedureIdAndClinicId(procedureId, clinicId)
                .orElseThrow(() -> new ResourceNotFoundException("PRICING_NOT_FOUND",
                        "Procedure pricing not found for procedure ID " + procedureId + " in clinic " + clinicId));

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

        ProcedurePricing updated = pricingRepository.save(existing);
        return mapper.toDto(updated);
    }

    @Override
    @Transactional
    public void delete(String procedureId, String clinicId) {
        validateClinic(clinicId);
        ProcedurePricing existing = pricingRepository.findByProcedureIdAndClinicId(procedureId, clinicId)
                .orElseThrow(() -> new ResourceNotFoundException("PRICING_NOT_FOUND",
                        "Procedure pricing not found for procedure ID " + procedureId + " in clinic " + clinicId));
        pricingRepository.delete(existing);
        log.info("Deleted pricing for procedureId={} and clinicId={}", procedureId, clinicId);
    }

    @Override
    public List<ProcedurePricingDTO> getAll() {
        // Fetch all pricings, refresh offer and pricing dynamically
        return pricingRepository.findAll().stream()
                .map(this::setOfferActive)      // refresh offerActive based on current time
                .map(this::calculatePricing)    // recalculate all pricing fields
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    // ---------------- Helper Methods ----------------

    private void validateClinic(String clinicId) {
        try {
            clinicFeignClient.getClinicById(clinicId);
        } catch (Exception e) {
            log.warn("Clinic not found: {}", clinicId);
            throw new ResourceNotFoundException("CLINIC_NOT_FOUND", "Clinic not found with ID: " + clinicId);
        }
    }

 // ---------------- Helper Methods ----------------

    private ProcedurePricing setOfferActive(ProcedurePricing procedure) {
        if (procedure.getOfferStart() == null || procedure.getOfferValidDate() == null) {
            procedure.setOfferActive(false);
            return procedure;
        }

        try {
            Instant now = Instant.now();
            Instant start = Instant.parse(procedure.getOfferStart());
            Instant end = Instant.parse(procedure.getOfferValidDate());

            boolean active = !now.isBefore(start) && !now.isAfter(end);  // inclusive
            procedure.setOfferActive(active);
        } catch (Exception e) {
            log.warn("Invalid offerStart/offerValidDate format for procedureId={}", procedure.getProcedureId());
            procedure.setOfferActive(false);
        }

        return procedure;
    }


    private ProcedurePricing calculatePricing(ProcedurePricing procedure) {
        double price = procedure.getPrice();
        double discountPercent = procedure.isOfferActive() ? procedure.getDiscountPercentage() : 0;

        double discountAmount = price * discountPercent / 100.0;
        double discountedPrice = price - discountAmount;

        double taxAmount = discountedPrice * procedure.getTaxPercentage() / 100.0;
        double gstAmount = discountedPrice * procedure.getGst() / 100.0;

        double clinicPay = discountedPrice + taxAmount + gstAmount;
        double finalCost = discountedPrice + procedure.getConsultationFee() + taxAmount + gstAmount;

        procedure.setDiscountAmount(discountAmount);
        procedure.setDiscountedCost(discountedPrice);
        procedure.setTaxAmount(taxAmount);
        procedure.setGstAmount(gstAmount);
        procedure.setClinicPay(clinicPay);
        procedure.setFinalCost(finalCost);

        return procedure;
    }
}
