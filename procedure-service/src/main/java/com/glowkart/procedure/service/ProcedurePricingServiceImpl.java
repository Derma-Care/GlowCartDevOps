package com.glowkart.procedure.service;


import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.glowkart.procedure.dto.ProcedurePricingDTO;
import com.glowkart.procedure.mapper.ProcedurePricingMapper;
import com.glowkart.procedure.model.Procedure;
import com.glowkart.procedure.model.ProcedurePricing;
import com.glowkart.procedure.repo.ProcedurePricingRepository;
import com.glowkart.procedure.repo.ProcedureRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProcedurePricingServiceImpl implements ProcedurePricingService {

    private final ProcedurePricingRepository pricingRepository;
    private final ProcedureRepository procedureRepository;
    private final ProcedurePricingMapper mapper;

    @Override
    public ProcedurePricingDTO create(ProcedurePricingDTO dto) {
        // 1. Validate procedureId exists
        Procedure procedure = procedureRepository.findById(dto.getProcedureId())
                .orElseThrow(() -> new RuntimeException("Procedure not found"));

        // 2. Check duplicate for same clinic
        pricingRepository.findByProcedureIdAndClinicId(dto.getProcedureId(), dto.getClinicId())
                .ifPresent(p -> {
                    throw new RuntimeException("Procedure already exists for this clinic");
                });

        // 3. Map DTO to entity
        ProcedurePricing entity = mapper.toEntity(dto);

        // 4. Set procedureName from Procedure master
        entity.setProcedureName(procedure.getProcedureName());

        // 5. Set timestamps
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        // 6. Calculate pricing
        calculatePricing(entity);

        // 7. Save
        ProcedurePricing saved = pricingRepository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public List<ProcedurePricingDTO> getByClinic(String clinicId) {
        return pricingRepository.findByClinicId(clinicId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProcedurePricingDTO getByProcedureAndClinic(String procedureId, String clinicId) {
        ProcedurePricing entity = pricingRepository.findByProcedureIdAndClinicId(procedureId, clinicId)
                .orElseThrow(() -> new RuntimeException("No pricing found for this procedure and clinic"));

        return mapper.toDto(entity);
    }

    @Override
    public ProcedurePricingDTO update(String procedureId, String clinicId, ProcedurePricingDTO dto) {
        ProcedurePricing existing = pricingRepository.findByProcedureIdAndClinicId(procedureId, clinicId)
                .orElseThrow(() -> new RuntimeException("Procedure not found for this clinic"));

        // Optional: update procedureName if procedureId changed
        if (!existing.getProcedureId().equals(dto.getProcedureId())) {
            Procedure procedure = procedureRepository.findById(dto.getProcedureId())
                    .orElseThrow(() -> new RuntimeException("Procedure not found"));
            existing.setProcedureId(procedure.getId());
            existing.setProcedureName(procedure.getProcedureName());
        }

        // Map other fields
        mapper.updateEntity(existing, dto);
        existing.setUpdatedAt(Instant.now());

        calculatePricing(existing);

        ProcedurePricing updated = pricingRepository.save(existing);
        return mapper.toDto(updated);
    }

    @Override
    public void delete(String procedureId, String clinicId) {
        pricingRepository.deleteByProcedureIdAndClinicId(procedureId, clinicId);
    }
    
 // New Method to Fetch All Data
    @Override
    public List<ProcedurePricingDTO> getAll() {
        // Fetch all procedure pricing data
        return pricingRepository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    private void calculatePricing(ProcedurePricing procedure) {
        procedure.setDiscountAmount(procedure.getPrice() * procedure.getDiscountPercentage() / 100.0);
        double discountedPrice = procedure.getPrice() - procedure.getDiscountAmount();
        procedure.setDiscountedCost(discountedPrice);

        procedure.setTaxAmount(discountedPrice * procedure.getTaxPercentage() / 100.0);
        procedure.setGstAmount(discountedPrice * procedure.getGst() / 100.0);
        procedure.setPlatformFee(discountedPrice * procedure.getPlatformFeePercentage() / 100.0);

        procedure.setClinicPay(discountedPrice + procedure.getTaxAmount() + procedure.getGstAmount() - procedure.getPlatformFee());
        procedure.setFinalCost(discountedPrice + procedure.getConsultationFee() + procedure.getTaxAmount() + procedure.getGstAmount() + procedure.getPlatformFee());
    }
}
