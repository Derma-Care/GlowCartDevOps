package com.glowkart.procedure.service;

import java.time.Instant;
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

        // Validate procedure
        Procedure procedure = procedureRepository.findById(dto.getProcedureId())
                .orElseThrow(() -> new ResourceNotFoundException("PROC_NOT_FOUND", 
                        "Procedure not found with ID: " + dto.getProcedureId()));

        // Validate clinic
        validateClinic(dto.getClinicId());

        // Check duplicate pricing
        pricingRepository.findByProcedureIdAndClinicId(dto.getProcedureId(), dto.getClinicId())
                .ifPresent(existing -> {
                    String name = existing.getProcedureName() != null ? existing.getProcedureName() : "Unknown";
                    throw new DuplicateResourceException("DUPLICATE_PRICING",
                            "Procedure '" + name + "' already has pricing set for this clinic.");
                });

        // Map DTO to entity
        ProcedurePricing entity = mapper.toEntity(dto);
        entity.setProcedureName(procedure.getProcedureName());
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        // Calculate pricing
        calculatePricing(entity);

        ProcedurePricing saved = pricingRepository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public List<ProcedurePricingDTO> getByClinic(String clinicId) {
        validateClinic(clinicId);
        return pricingRepository.findByClinicId(clinicId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProcedurePricingDTO getByProcedureAndClinic(String procedureId, String clinicId) {
        validateClinic(clinicId);
        ProcedurePricing entity = pricingRepository.findByProcedureIdAndClinicId(procedureId, clinicId)
                .orElseThrow(() -> new ResourceNotFoundException("PRICING_NOT_FOUND",
                        "No pricing found for procedure ID " + procedureId + " in clinic " + clinicId));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public ProcedurePricingDTO update(String procedureId, String clinicId, ProcedurePricingDTO dto) {
        validateClinic(clinicId);

        ProcedurePricing existing = pricingRepository.findByProcedureIdAndClinicId(procedureId, clinicId)
                .orElseThrow(() -> new ResourceNotFoundException("PRICING_NOT_FOUND",
                        "Procedure pricing not found for procedure ID " + procedureId + " in clinic " + clinicId));

        // Update procedure if changed
        if (dto.getProcedureId() != null && !dto.getProcedureId().equals(existing.getProcedureId())) {
            Procedure procedure = procedureRepository.findById(dto.getProcedureId())
                    .orElseThrow(() -> new ResourceNotFoundException("PROC_NOT_FOUND",
                            "Procedure not found with ID: " + dto.getProcedureId()));
            existing.setProcedureId(procedure.getId());
            existing.setProcedureName(procedure.getProcedureName());
        }

        mapper.updateEntity(existing, dto);
        existing.setUpdatedAt(Instant.now());

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
        return pricingRepository.findAll().stream()
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

    private void calculatePricing(ProcedurePricing procedure) {
        // 1. Calculate discount
        double discountAmount = procedure.getPrice() * procedure.getDiscountPercentage() / 100.0;
        procedure.setDiscountAmount(discountAmount);

        double discountedPrice = procedure.getPrice() - discountAmount;
        procedure.setDiscountedCost(discountedPrice);

        // 2. Calculate taxes and platform fee
        double taxAmount = discountedPrice * procedure.getTaxPercentage() / 100.0;
        double gstAmount = discountedPrice * procedure.getGst() / 100.0;
        double platformFee = discountedPrice * procedure.getPlatformFeePercentage() / 100.0;

        procedure.setTaxAmount(taxAmount);
        procedure.setGstAmount(gstAmount);
        procedure.setPlatformFee(platformFee);

        // 3. Calculate final amounts
        double clinicPay = discountedPrice + taxAmount + gstAmount - platformFee;
        double finalCost = discountedPrice + procedure.getConsultationFee() + taxAmount + gstAmount + platformFee;

        procedure.setClinicPay(clinicPay);
        procedure.setFinalCost(finalCost);
    }

}
