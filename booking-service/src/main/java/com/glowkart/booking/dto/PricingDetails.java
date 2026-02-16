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

    // 🔥 PLATFORM FEE (NEW)
    double platformFeePercentage;
    double platformFee;

    // 🔥 PAYMENT
    String paymentType; // FULL_PAYMENT / PARTIAL_PAYMENT
    double partialPaymentPercentage;
    double partialAmount;
    double dueAmount;

    double finalAmount;

    // ================= PROCEDURE =================
    public static PricingDetails fromProcedurePricing(ProcedurePricingDTO dto) {

        double platformFee = dto.getPlatformFee() > 0 ? dto.getPlatformFee() : 0;
        double finalAmount = dto.getFinalCost();

        return PricingDetails.builder()
                .serviceName(dto.getProcedureName())
                .price(dto.getPrice())

                .discountAmount(dto.getDiscountAmount())
                .discountPercentage(dto.getDiscount())
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

                // 🔥 PLATFORM FEE
                .platformFeePercentage(dto.getPlatformFeePercentage())
                .platformFee(platformFee)

                // 🔥 PAYMENT
                .paymentType(dto.getPaymentType())
                .partialPaymentPercentage(dto.getPartialPaymentPercentage())
                .partialAmount(dto.getPartialAmount())
                .dueAmount(dto.getDueAmount())

                // 🔥 FINAL
                .finalAmount(finalAmount)
                .build();
    }

    // ================= PACKAGE =================
    public static PricingDetails fromPackagePricing(ProcedurePackageDTO dto) {

        double platformFee = dto.getPlatformFee() > 0 ? dto.getPlatformFee() : 0;
        double finalAmount = dto.getFinalCost();

        return PricingDetails.builder()
                .serviceName(dto.getPackageName())
                .price(dto.getPrice())

                .discountAmount(dto.getDiscountAmount())
                .discountPercentage(dto.getDiscountPercentage())
                .discountedCost(dto.getDiscountedCost())

                .totalDiscountAmount(dto.getTotalDiscountAmount())
                .totalDiscountPercentage(dto.getTotalDiscountPercentage())

                .ngkDiscountAmount(dto.getNgkDiscountAmount())
                .ngkDiscountPercentage(dto.getNgkDiscountPercentage())

                .taxPercentage(dto.getTaxPercentage())
                .taxAmount(dto.getTaxAmount())

                .gst(dto.getGst())
                .gstAmount(dto.getGstAmount())

                .consultationFee(dto.getConsultationFee())

                // 🔥 PLATFORM FEE
                .platformFeePercentage(dto.getPlatformFeePercentage())
                .platformFee(platformFee)

                // 🔥 PAYMENT
                .paymentType(dto.getPaymentType())
                .partialPaymentPercentage(dto.getPartialPaymentPercentage())
                .partialAmount(dto.getPartialAmount())
                .dueAmount(dto.getDueAmount())

                // 🔥 FINAL
                .finalAmount(finalAmount)
                .build();
    }
}
