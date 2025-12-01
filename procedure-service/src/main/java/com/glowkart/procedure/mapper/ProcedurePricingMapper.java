package com.glowkart.procedure.mapper;

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
        entity.setMinTime(dto.getMinTime());
        entity.setPrice(dto.getPrice());
        entity.setDiscountPercentage(dto.getDiscountPercentage());
        entity.setTaxPercentage(dto.getTaxPercentage());
        entity.setGst(dto.getGst());
        entity.setConsultationFee(dto.getConsultationFee());
        entity.setOfferStart(dto.getOfferStart());
        entity.setOfferValidDate(dto.getOfferValidDate());
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
        dto.setMinTime(entity.getMinTime());
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
        dto.setOfferStart(entity.getOfferStart());
        dto.setOfferValidDate(entity.getOfferValidDate());
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
        entity.setMinTime(dto.getMinTime());
        entity.setPrice(dto.getPrice());
        entity.setDiscountPercentage(dto.getDiscountPercentage());
        entity.setTaxPercentage(dto.getTaxPercentage());
        entity.setGst(dto.getGst());
        entity.setConsultationFee(dto.getConsultationFee());
        entity.setOfferStart(dto.getOfferStart());
        entity.setOfferValidDate(dto.getOfferValidDate());
    }
}
