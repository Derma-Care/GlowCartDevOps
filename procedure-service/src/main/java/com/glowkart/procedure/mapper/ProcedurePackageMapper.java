package com.glowkart.procedure.mapper;

import org.springframework.stereotype.Component;
import com.glowkart.procedure.dto.ProcedurePackageDTO;
import com.glowkart.procedure.dto.ProcedureItemDTO;
import com.glowkart.procedure.model.ProcedurePackage;
import com.glowkart.procedure.model.ProcedureItem;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProcedurePackageMapper {

    public ProcedurePackage toEntity(ProcedurePackageDTO dto) {
        ProcedurePackage entity = new ProcedurePackage();
        entity.setId(dto.getPackageId());
        entity.setPackageName(dto.getPackageName());
        entity.setClinicId(dto.getClinicId());
        entity.setClinicName(dto.getClinicName());
        entity.setClinicAddress(dto.getClinicAddress());

        entity.setProcedures(dto.getProcedures() != null ?
                dto.getProcedures().stream()
                        .map(this::toEntityItem)
                        .collect(Collectors.toList()) : null);

        entity.setSittings(dto.getSittings());
        entity.setDescription(dto.getDescription());
        entity.setPackageImage(dto.getPackageImage());

        entity.setPrice(dto.getPrice());
        entity.setDiscountPercentage(dto.getDiscountPercentage());
        entity.setDiscountAmount(dto.getDiscountAmount());
        entity.setTaxPercentage(dto.getTaxPercentage());
        entity.setTaxAmount(dto.getTaxAmount());
        entity.setGst(dto.getGst());
        entity.setGstAmount(dto.getGstAmount());
        entity.setConsultationFee(dto.getConsultationFee());

        entity.setDiscountedCost(dto.getDiscountedCost());
        entity.setClinicPay(dto.getClinicPay());
        entity.setFinalCost(dto.getFinalCost());

        // ⭐ OFFER FIELDS
        entity.setOfferStart(dto.getOfferStart());
        entity.setOfferValidDate(dto.getOfferValidDate());
        entity.setOfferActive(dto.isOfferActive());

        // ⭐ NGK & Total Discount FIELDS ⭐
        entity.setNgkDiscountPercentage(dto.getNgkDiscountPercentage());
        entity.setNgkDiscountAmount(dto.getNgkDiscountAmount());
        entity.setTotalDiscountPercentage(dto.getTotalDiscountPercentage());
        entity.setTotalDiscountAmount(dto.getTotalDiscountAmount());

        return entity;
    }

    private ProcedureItem toEntityItem(ProcedureItemDTO dto) {
        ProcedureItem item = new ProcedureItem();
        item.setProcedureName(dto.getProcedureName());
        item.setNoOfSittings(dto.getNoOfSittings());
        return item;
    }

    public ProcedurePackageDTO toDto(ProcedurePackage entity) {
        ProcedurePackageDTO dto = new ProcedurePackageDTO();
        dto.setPackageId(entity.getId());
        dto.setPackageName(entity.getPackageName());
        dto.setClinicId(entity.getClinicId());
        dto.setClinicName(entity.getClinicName());
        dto.setClinicAddress(entity.getClinicAddress());

        dto.setProcedures(entity.getProcedures() != null ?
                entity.getProcedures().stream()
                        .map(this::toDtoItem)
                        .collect(Collectors.toList()) : null);

        dto.setSittings(entity.getSittings());
        dto.setDescription(entity.getDescription());
        dto.setPackageImage(entity.getPackageImage());

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

        // ⭐ OFFER FIELDS
        dto.setOfferStart(entity.getOfferStart());
        dto.setOfferValidDate(entity.getOfferValidDate());
        dto.setOfferActive(entity.isOfferActive());

        // ⭐ NGK & Total Discount FIELDS ⭐
        dto.setNgkDiscountPercentage(entity.getNgkDiscountPercentage());
        dto.setNgkDiscountAmount(entity.getNgkDiscountAmount());
        dto.setTotalDiscountPercentage(entity.getTotalDiscountPercentage());
        dto.setTotalDiscountAmount(entity.getTotalDiscountAmount());

        return dto;
    }

    private ProcedureItemDTO toDtoItem(ProcedureItem item) {
        ProcedureItemDTO dto = new ProcedureItemDTO();
        dto.setProcedureName(item.getProcedureName());
        dto.setNoOfSittings(item.getNoOfSittings());
        return dto;
    }
}
