package com.glowkart.procedure.mapper;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Component;

import com.glowkart.procedure.dto.ProcedurePricingDTO;
import com.glowkart.procedure.model.ProcedurePricing;

@Component
public class ProcedurePricingMapper {

    public ProcedurePricing toEntity(ProcedurePricingDTO dto) {
        ProcedurePricing entity = new ProcedurePricing();

        entity.setProcedureId(dto.getProcedureId());
        entity.setClinicId(dto.getClinicId());
        entity.setDescription(dto.getDescription());
        entity.setProcedureImage(dto.getProcedureImage());
        entity.setPreProcedureQA(dto.getPreProcedureQA() != null ? dto.getPreProcedureQA() : List.of());
        entity.setProcedureQA(dto.getProcedureQA() != null ? dto.getProcedureQA() : List.of());
        entity.setPostProcedureQA(dto.getPostProcedureQA() != null ? dto.getPostProcedureQA() : List.of());
        entity.setSittings(dto.getSittings());

        // convert "30 mins" -> 30
        entity.setMinTime(parseMinTime(dto.getMinTime()));

        // convert ISO string -> Instant
        entity.setOfferStart(parseInstant(dto.getOfferStart()));
        entity.setOfferValidDate(parseInstant(dto.getOfferValidDate()));

        entity.setPrice(dto.getPrice());
        entity.setDiscountPercentage(dto.getDiscountPercentage());
        entity.setTaxPercentage(dto.getTaxPercentage());
        entity.setGst(dto.getGst());
        entity.setConsultationFee(dto.getConsultationFee());

        return entity;
    }

    public ProcedurePricingDTO toDto(ProcedurePricing entity) {
        ProcedurePricingDTO dto = new ProcedurePricingDTO();
        dto.setProcedureId(entity.getProcedureId());
        dto.setProcedureName(entity.getProcedureName());
        dto.setClinicId(entity.getClinicId());
        dto.setDescription(entity.getDescription());
        dto.setProcedureImage(entity.getProcedureImage());
        dto.setPreProcedureQA(entity.getPreProcedureQA() != null ? entity.getPreProcedureQA() : List.of());
        dto.setProcedureQA(entity.getProcedureQA() != null ? entity.getProcedureQA() : List.of());
        dto.setPostProcedureQA(entity.getPostProcedureQA() != null ? entity.getPostProcedureQA() : List.of());
        dto.setSittings(entity.getSittings());

        // int -> "30 mins"
        dto.setMinTime(entity.getMinTime() + " mins");

        // Instant -> ISO string
        dto.setOfferStart(entity.getOfferStart() != null ? entity.getOfferStart().toString() : null);
        dto.setOfferValidDate(entity.getOfferValidDate() != null ? entity.getOfferValidDate().toString() : null);

        dto.setPrice(entity.getPrice());
        dto.setDiscountPercentage(entity.getDiscountPercentage());
        dto.setDiscountAmount(entity.getDiscountAmount());
        dto.setTaxPercentage(entity.getTaxPercentage());
        dto.setTaxAmount(entity.getTaxAmount());
        dto.setGst(entity.getGst());
        dto.setGstAmount(entity.getGstAmount());
        dto.setConsultationFee(entity.getConsultationFee());
        dto.setDiscountedCost(entity.getDiscountedCost());
        dto.setClinicPay(entity.getClinicPay());
        dto.setFinalCost(entity.getFinalCost());
        dto.setOfferActive(entity.isOfferActive());

        return dto;
    }

    public void updateEntity(ProcedurePricing entity, ProcedurePricingDTO dto) {
        entity.setClinicId(dto.getClinicId());
        entity.setDescription(dto.getDescription());
        entity.setProcedureImage(dto.getProcedureImage());
        entity.setPreProcedureQA(dto.getPreProcedureQA() != null ? dto.getPreProcedureQA() : List.of());
        entity.setProcedureQA(dto.getProcedureQA() != null ? dto.getProcedureQA() : List.of());
        entity.setPostProcedureQA(dto.getPostProcedureQA() != null ? dto.getPostProcedureQA() : List.of());
        entity.setSittings(dto.getSittings());
        entity.setMinTime(parseMinTime(dto.getMinTime()));
        entity.setPrice(dto.getPrice());
        entity.setDiscountPercentage(dto.getDiscountPercentage());
        entity.setTaxPercentage(dto.getTaxPercentage());
        entity.setGst(dto.getGst());
        entity.setConsultationFee(dto.getConsultationFee());
        entity.setOfferStart(parseInstant(dto.getOfferStart()));
        entity.setOfferValidDate(parseInstant(dto.getOfferValidDate()));
    }

    // ------------------- Helper Methods -------------------
    private int parseMinTime(String minTimeStr) {
        if (minTimeStr == null || minTimeStr.isEmpty()) return 0;
        try {
            return Integer.parseInt(minTimeStr.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private Instant parseInstant(String instantStr) {
        if (instantStr == null || instantStr.isEmpty()) return null;
        try {
            return Instant.parse(instantStr);
        } catch (Exception e) {
            return null;
        }
    }
}

