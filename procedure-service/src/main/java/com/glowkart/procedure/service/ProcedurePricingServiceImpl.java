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

    // ======================================================
    //                     CREATE
    // ======================================================
    @Override
    @Transactional
    public ProcedurePricingDTO create(ProcedurePricingDTO dto) {

        // Validate discounts and clinic
        validateDiscountAndOffer(dto);
        validateClinic(dto.getClinicId());

        // Fetch procedure
        Procedure procedure = procedureRepository.findById(dto.getProcedureId())
                .orElseThrow(() -> new ResourceNotFoundException("PROC_NOT_FOUND",
                        "Procedure not found with ID: " + dto.getProcedureId()));

        // Check for duplicate pricing
        if (pricingRepository.existsByProcedureIdAndClinicId(dto.getProcedureId(), dto.getClinicId())) {
            throw new DuplicateResourceException("DUPLICATE_PRICING",
                    "Pricing already exists for this procedure and clinic.");
        }

        // Map DTO to entity
        ProcedurePricing entity = mapper.toEntity(dto);
        entity.setProcedureName(procedure.getProcedureName());
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        // Set offer status
        setOfferActive(entity);

        // Calculate all pricing fields including total discount
        calculatePricing(entity);

        // Map entity to DTO BEFORE saving to include calculated fields in response
        ProcedurePricingDTO responseDto = mapper.toDto(entity);

        // Save entity
        pricingRepository.save(entity);

        // Return DTO with all fields
        return responseDto;
    }



    // ======================================================
    //                     GET BY CLINIC
    // ======================================================
    @Override
    public List<ProcedurePricingDTO> getByClinic(String clinicId) {
        validateClinic(clinicId);

        return pricingRepository.findByClinicId(clinicId).stream()
                .map(this::setOfferActive)
                .map(this::calculatePricing)
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    // ======================================================
    //           GET BY PROCEDURE + CLINIC
    // ======================================================
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

    // ======================================================
    //                     UPDATE (PUT)
    // ======================================================
 // ======================================================
//  UPDATE (PUT)
//======================================================
@Override
@Transactional
public ProcedurePricingDTO update(String procedureId, String clinicId, ProcedurePricingDTO dto) {

validateClinic(clinicId);

ProcedurePricing existing = pricingRepository.findByProcedureIdAndClinicId(procedureId, clinicId)
.orElseThrow(() -> new ResourceNotFoundException("PRICING_NOT_FOUND",
 "Procedure pricing not found for procedure ID " + procedureId));

// Change procedure only if different
if (dto.getProcedureId() != null && !dto.getProcedureId().equals(existing.getProcedureId())) {
Procedure procedure = procedureRepository.findById(dto.getProcedureId())
.orElseThrow(() -> new ResourceNotFoundException("PROC_NOT_FOUND",
     "Procedure not found with ID: " + dto.getProcedureId()));

existing.setProcedureId(procedure.getId());
existing.setProcedureName(procedure.getProcedureName());
}

// Update all other fields using mapper (INCLUDING NGK)
mapper.updateEntity(existing, dto);

existing.setUpdatedAt(Instant.now());

setOfferActive(existing);
calculatePricing(existing);

return mapper.toDto(pricingRepository.save(existing));
}


    // ======================================================
    //                     DELETE
    // ======================================================
    @Override
    @Transactional
    public void delete(String procedureId, String clinicId) {
        validateClinic(clinicId);

        ProcedurePricing existing = pricingRepository.findByProcedureIdAndClinicId(procedureId, clinicId)
                .orElseThrow(() -> new ResourceNotFoundException("PRICING_NOT_FOUND",
                        "Procedure pricing not found for procedure ID " + procedureId));

        pricingRepository.delete(existing);
    }

    // ======================================================
    //                     GET ALL
    // ======================================================
    @Override
    public List<ProcedurePricingDTO> getAll() {
        return pricingRepository.findAll().stream()
                .map(this::setOfferActive)
                .map(this::calculatePricing)
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    // ======================================================
    //                     VALIDATIONS
    // ======================================================
    private void validateClinic(String clinicId) {
        try {
            clinicFeignClient.getClinicById(clinicId);
        } catch (Exception e) {
            throw new ResourceNotFoundException("CLINIC_NOT_FOUND",
                    "Clinic not found with ID: " + clinicId);
        }
    }

    private void validateDiscountAndOffer(ProcedurePricingDTO dto) {

        Double discount = dto.getDiscountPercentage();
        String offerStart = dto.getOfferStart();

        boolean hasDiscount = discount != null && discount > 0;
        boolean hasOfferStart = offerStart != null && !offerStart.isBlank();

        if (hasOfferStart && !hasDiscount) {
            throw new IllegalArgumentException("discountPercentage is required when offerStart is provided");
        }

        if (hasDiscount && !hasOfferStart) {
            throw new IllegalArgumentException("offerStart is required when discountPercentage > 0");
        }

        // NGK discount has no validation requirement
    }

    // ======================================================
    //                     OFFER LOGIC
    // ======================================================
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

    // ======================================================
    //                  PRICING CALCULATION
    // ======================================================
    private ProcedurePricing calculatePricing(ProcedurePricing procedure) {

        double price = procedure.getPrice(); // primitive, always has a value

        // Clinic discount
        double discountPercent = procedure.isOfferActive() ? procedure.getDiscountPercentage() : 0.0;
        double discountAmount = round(price * discountPercent / 100.0);
        double discountedPrice = round(price - discountAmount);

        // Taxes
        double taxAmount = round(discountedPrice * procedure.getTaxPercentage() / 100.0);
        double gstAmount = round(discountedPrice * procedure.getGst() / 100.0);

        // Clinic pay before NGK
        double clinicPay = round(discountedPrice + taxAmount + gstAmount + procedure.getConsultationFee());

        // NGK discount
        double ngkPercent = procedure.getNgkDiscountPercentage(); // primitive
        double ngkAmount = round(clinicPay * ngkPercent / 100.0);

        // Final cost after NGK discount
        double finalCost = round(clinicPay - ngkAmount);

        // Total discount for reporting (clinic + NGK)
        double totalDiscountAmount = round(discountAmount + ngkAmount);
        double totalDiscountPercent = discountPercent + ngkPercent;

        // Set values
        procedure.setDiscountAmount(discountAmount);
        procedure.setDiscountedCost(discountedPrice);
        procedure.setTaxAmount(taxAmount);
        procedure.setGstAmount(gstAmount);
        procedure.setClinicPay(clinicPay);

        procedure.setNgkDiscountAmount(ngkAmount);
        procedure.setFinalCost(finalCost);

        procedure.setTotalDiscountPercentage(totalDiscountPercent);
        procedure.setTotalDiscountAmount(totalDiscountAmount);

        return procedure;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }



    // ======================================================
    //               BEST PRICE BY PROCEDURE
    // ======================================================
    @Override
    public ProcedurePricingDTO getByProcedureId(String procedureId) {

        Procedure procedure = procedureRepository.findById(procedureId)
                .orElseThrow(() -> new ResourceNotFoundException("PROC_NOT_FOUND",
                        "Procedure not found with ID: " + procedureId));

        List<ProcedurePricing> pricings = pricingRepository.findByProcedureId(procedureId);

        if (pricings.isEmpty()) {
            throw new ResourceNotFoundException("PRICING_NOT_FOUND",
                    "No pricing found for procedure ID " + procedureId);
        }

        ProcedurePricing best = pricings.stream()
                .map(this::setOfferActive)
                .max(Comparator.comparingDouble(p -> p.isOfferActive() ? p.getDiscountPercentage() : 0))
                .orElse(pricings.get(0));

        calculatePricing(best);

        return mapper.toDto(best);
    }
}
