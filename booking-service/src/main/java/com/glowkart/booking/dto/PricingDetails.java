package com.glowkart.booking.dto;


import com.glowkart.booking.dto.ProcedurePackageDTO;
import com.glowkart.booking.dto.ProcedurePricingDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class PricingDetails {
    String serviceName;
    double price;
    double discountAmount;
    double discountPercentage;
    double discountedCost;
    double totalDiscountAmount;
    double totalDiscountPercentage;
    double ngkDiscountAmount;
    double ngkDiscountPercentage;
    double taxPercentage;
    double taxAmount;
    double gst;
    double gstAmount;
    double consultationFee;
    double finalAmount;

    // Convert ProcedurePricingDTO to PricingDetails
    public static PricingDetails fromProcedurePricing(ProcedurePricingDTO dto) {
        double discountPercent = dto.getDiscount() > 0 ? dto.getDiscount() : (dto.getDiscountAmount() / dto.getPrice()) * 100;
        return PricingDetails.builder()
                .serviceName(dto.getProcedureName())
                .price(dto.getPrice())
                .discountAmount(dto.getDiscountAmount())
                .discountPercentage(discountPercent)
                .discountedCost(dto.getPrice() - dto.getDiscountAmount())
                .totalDiscountAmount(dto.getTotalDiscountAmount())
                .totalDiscountPercentage(dto.getTotalDiscountPercentage())
                .ngkDiscountAmount(dto.getNgkDiscountAmount())
                .ngkDiscountPercentage(dto.getNgkDiscountPercentage())
                .taxPercentage(dto.getTaxPercentage())
                .taxAmount(dto.getTaxAmount())
                .gst(dto.getGst())
                .gstAmount(dto.getGstAmount())
                .consultationFee(dto.getConsultationFee())
                .finalAmount(dto.getFinalCost())
                .build();
    }

    // Convert ProcedurePackageDTO to PricingDetails
    public static PricingDetails fromPackagePricing(ProcedurePackageDTO dto) {
        return PricingDetails.builder()
                .serviceName(dto.getPackageName())
                .price(dto.getPrice())
                .discountAmount(dto.getDiscountAmount()) // ✅ use actual value
                .discountPercentage(dto.getDiscountPercentage()) // ✅ use actual value
                .discountedCost(dto.getDiscountedCost()) // ✅ use actual value
                .totalDiscountAmount(dto.getTotalDiscountAmount())
                .totalDiscountPercentage(dto.getTotalDiscountPercentage())
                .ngkDiscountAmount(dto.getNgkDiscountAmount()) // ✅ use actual value
                .ngkDiscountPercentage(dto.getNgkDiscountPercentage()) // ✅ use actual value
                .taxPercentage(dto.getTaxPercentage())
                .taxAmount(dto.getTaxAmount())
                .gst(dto.getGst())
                .gstAmount(dto.getGstAmount())
                .consultationFee(dto.getConsultationFee())
                .finalAmount(dto.getFinalCost())
                .build();
    }

}

