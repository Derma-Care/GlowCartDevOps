package com.glowkart.booking.dto;

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

    // ✅ PLATFORM FEE
    double platformFeePercentage;  // usually 2%
    double platformFeeAmount;

    // 🔥 PAYMENT
    String paymentType; // FULL_PAYMENT / PARTIAL_PAYMENT
    double partialPaymentPercentage;
    double partialAmount;
    double dueAmount;

    double finalAmount;

    // ================= PROCEDURE =================
    public static PricingDetails fromProcedurePricing(ProcedurePricingDTO dto) {

        double discountedCost = dto.getPrice() - dto.getDiscountAmount();
        double platformFeePercentage = 2.0; // fixed 2%
        double platformFeeAmount = discountedCost * platformFeePercentage / 100;

        double finalAmount = discountedCost
                + platformFeeAmount
                + dto.getTaxAmount()
                + dto.getGstAmount()
                + dto.getConsultationFee();

        return PricingDetails.builder()
                .serviceName(dto.getProcedureName())
                .price(dto.getPrice())
                .discountAmount(dto.getDiscountAmount())
                .discountPercentage(dto.getDiscount())
                .discountedCost(discountedCost)
                .totalDiscountAmount(dto.getTotalDiscountAmount())
                .totalDiscountPercentage(dto.getTotalDiscountPercentage())
                .ngkDiscountAmount(dto.getNgkDiscountAmount())
                .ngkDiscountPercentage(dto.getNgkDiscountPercentage())
                .taxPercentage(dto.getTaxPercentage())
                .taxAmount(dto.getTaxAmount())
                .gst(dto.getGst())
                .gstAmount(dto.getGstAmount())
                .consultationFee(dto.getConsultationFee())
                .platformFeePercentage(platformFeePercentage)
                .platformFeeAmount(platformFeeAmount)
                .paymentType(dto.getPaymentType())
                .partialPaymentPercentage(dto.getPartialPaymentPercentage())
                .partialAmount(dto.getPartialAmount())
                .dueAmount(dto.getDueAmount())
                .finalAmount(finalAmount)
                .build();
    }

    // ================= PACKAGE =================
    public static PricingDetails fromPackagePricing(ProcedurePackageDTO dto) {

        double discountedCost = dto.getDiscountedCost();
        double platformFeePercentage = 2.0; // fixed 2%
        double platformFeeAmount = discountedCost * platformFeePercentage / 100;

        double finalAmount = discountedCost
                + platformFeeAmount
                + dto.getTaxAmount()
                + dto.getGstAmount()
                + dto.getConsultationFee();

        return PricingDetails.builder()
                .serviceName(dto.getPackageName())
                .price(dto.getPrice())
                .discountAmount(dto.getDiscountAmount())
                .discountPercentage(dto.getDiscountPercentage())
                .discountedCost(discountedCost)
                .totalDiscountAmount(dto.getTotalDiscountAmount())
                .totalDiscountPercentage(dto.getTotalDiscountPercentage())
                .ngkDiscountAmount(dto.getNgkDiscountAmount())
                .ngkDiscountPercentage(dto.getNgkDiscountPercentage())
                .taxPercentage(dto.getTaxPercentage())
                .taxAmount(dto.getTaxAmount())
                .gst(dto.getGst())
                .gstAmount(dto.getGstAmount())
                .consultationFee(dto.getConsultationFee())
                .platformFeePercentage(platformFeePercentage)
                .platformFeeAmount(platformFeeAmount)
                .paymentType(dto.getPaymentType())
                .partialPaymentPercentage(dto.getPartialPaymentPercentage())
                .partialAmount(dto.getPartialAmount())
                .dueAmount(dto.getDueAmount())
                .finalAmount(finalAmount)
                .build();
    }
}
