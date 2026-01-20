package com.glowkart.procedure.mapper;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.glowkart.procedure.dto.ProcedurePricingDTO;
import com.glowkart.procedure.model.ProcedurePricing;

@Component
public class ProcedurePricingMapper {

    // ---------------- SANITIZE KEYS for MongoDB ----------------
    private Map<String, List<String>> sanitizeMapKeys(Map<String, List<String>> map) {
        return map.entrySet().stream()
                .collect(Collectors.toMap(e -> e.getKey().replace(".", "_"), Map.Entry::getValue));
    }

    private List<Map<String, List<String>>> sanitizeQAList(List<Map<String, List<String>>> list) {
        return list.stream().map(this::sanitizeMapKeys).collect(Collectors.toList());
    }

    // ---------------- RESTORE KEYS for API response ----------------
    private Map<String, List<String>> restoreMapKeys(Map<String, List<String>> map) {
        return map.entrySet().stream()
                .collect(Collectors.toMap(e -> e.getKey().replace("_", "."), Map.Entry::getValue));
    }

    private List<Map<String, List<String>>> restoreQAList(List<Map<String, List<String>>> list) {
        return list.stream().map(this::restoreMapKeys).collect(Collectors.toList());
    }

    // ================= DTO → ENTITY =================
    public ProcedurePricing toEntity(ProcedurePricingDTO dto) {
        ProcedurePricing entity = new ProcedurePricing();

        entity.setProcedureId(dto.getProcedureId());
        entity.setClinicId(dto.getClinicId());
        entity.setDescription(dto.getDescription());
        entity.setProcedureImage(dto.getProcedureImage());
        entity.setProcedureLink(dto.getProcedureLink());

        entity.setPreProcedureQA(dto.getPreProcedureQA() != null ? sanitizeQAList(dto.getPreProcedureQA()) : List.of());
        entity.setProcedureQA(dto.getProcedureQA() != null ? sanitizeQAList(dto.getProcedureQA()) : List.of());
        entity.setPostProcedureQA(dto.getPostProcedureQA() != null ? sanitizeQAList(dto.getPostProcedureQA()) : List.of());

        entity.setSittings(dto.getSittings());
        entity.setMinTime(dto.getMinTime());

        entity.setPrice(dto.getPrice());
        entity.setDiscountPercentage(dto.getDiscountPercentage());
        entity.setTaxPercentage(dto.getTaxPercentage());
        entity.setGst(dto.getGst());
        entity.setConsultationFee(dto.getConsultationFee());

        // NGK fields
        entity.setNgkDiscountPercentage(dto.getNgkDiscountPercentage());
        entity.setNgkDiscountAmount(dto.getNgkDiscountAmount());

        entity.setPaymentType(dto.getPaymentType());
        entity.setPartialPaymentPercentage(dto.getPartialPaymentPercentage());
        entity.setDueAmount(dto.getDueAmount());
        entity.setPartialAmount(dto.getPartialAmount());

        // Note: platformFee and platformFeePercentage are not stored in DB

        return entity;
    }

    // ================= ENTITY → DTO =================
    public ProcedurePricingDTO toDto(ProcedurePricing entity) {
        ProcedurePricingDTO dto = new ProcedurePricingDTO();

        dto.setProcedureId(entity.getProcedureId());
        dto.setProcedureName(entity.getProcedureName());
        dto.setClinicId(entity.getClinicId());
        dto.setDescription(entity.getDescription());
        dto.setProcedureImage(entity.getProcedureImage());
        dto.setProcedureLink(entity.getProcedureLink());

        dto.setPreProcedureQA(entity.getPreProcedureQA() != null ? restoreQAList(entity.getPreProcedureQA()) : List.of());
        dto.setProcedureQA(entity.getProcedureQA() != null ? restoreQAList(entity.getProcedureQA()) : List.of());
        dto.setPostProcedureQA(entity.getPostProcedureQA() != null ? restoreQAList(entity.getPostProcedureQA()) : List.of());

        dto.setSittings(entity.getSittings());
        dto.setMinTime(entity.getMinTime());
        dto.setOfferStart(entity.getOfferStart());
        dto.setOfferValidDate(entity.getOfferValidDate());
        dto.setOfferActive(entity.isOfferActive());

        dto.setPrice(entity.getPrice());
        dto.setDiscountPercentage(entity.getDiscountPercentage());
        dto.setDiscountAmount(entity.getDiscountAmount());

        dto.setNgkDiscountPercentage(entity.getNgkDiscountPercentage());
        dto.setNgkDiscountAmount(entity.getNgkDiscountAmount());

        dto.setTotalDiscountPercentage(entity.getTotalDiscountPercentage());
        dto.setTotalDiscountAmount(entity.getTotalDiscountAmount());
        dto.setTotalDiscountedAmount(entity.getTotalDiscountedAmount());

        dto.setTaxPercentage(entity.getTaxPercentage());
        dto.setTaxAmount(entity.getTaxAmount());
        dto.setGst(entity.getGst());
        dto.setGstAmount(entity.getGstAmount());
        dto.setConsultationFee(entity.getConsultationFee());

        dto.setDiscountedCost(entity.getDiscountedCost());
        dto.setClinicPay(entity.getClinicPay());
        dto.setFinalCost(entity.getFinalCost());

        dto.setPaymentType(entity.getPaymentType());
        dto.setPartialPaymentPercentage(entity.getPartialPaymentPercentage());
        dto.setDueAmount(entity.getDueAmount());
        dto.setPartialAmount(entity.getPartialAmount());

        // platformFee and platformFeePercentage will be set dynamically in the service
        return dto;
    }

    // ================= UPDATE ENTITY =================
    public void updateEntity(ProcedurePricing entity, ProcedurePricingDTO dto) {
        entity.setClinicId(dto.getClinicId());
        entity.setDescription(dto.getDescription());
        entity.setProcedureImage(dto.getProcedureImage());
        entity.setProcedureLink(dto.getProcedureLink());

        entity.setPreProcedureQA(dto.getPreProcedureQA() != null ? sanitizeQAList(dto.getPreProcedureQA()) : List.of());
        entity.setProcedureQA(dto.getProcedureQA() != null ? sanitizeQAList(dto.getProcedureQA()) : List.of());
        entity.setPostProcedureQA(dto.getPostProcedureQA() != null ? sanitizeQAList(dto.getPostProcedureQA()) : List.of());

        entity.setSittings(dto.getSittings());
        entity.setMinTime(dto.getMinTime());

        entity.setPrice(dto.getPrice());
        entity.setDiscountPercentage(dto.getDiscountPercentage());
        entity.setTaxPercentage(dto.getTaxPercentage());
        entity.setGst(dto.getGst());
        entity.setConsultationFee(dto.getConsultationFee());

        // NGK only
        if (dto.getNgkDiscountPercentage() > 0) {
            entity.setNgkDiscountPercentage(dto.getNgkDiscountPercentage());
        }
        if (dto.getNgkDiscountAmount() > 0) {
            entity.setNgkDiscountAmount(dto.getNgkDiscountAmount());
        }

        entity.setPaymentType(dto.getPaymentType());
        entity.setPartialPaymentPercentage(dto.getPartialPaymentPercentage());
        entity.setDueAmount(dto.getDueAmount());
        entity.setPartialAmount(dto.getPartialAmount());

        // ❌ platformFee and platformFeePercentage are never updated in DB
    }
}
