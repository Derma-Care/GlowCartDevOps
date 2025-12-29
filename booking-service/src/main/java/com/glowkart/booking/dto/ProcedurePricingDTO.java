package com.glowkart.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor 
public class ProcedurePricingDTO { 
	private String procedureId; 
	private String procedureName; 
	private double price; 
	private double discount;
	private double discountAmount; // Offer discount 
	private double taxAmount; 
	private double taxPercentage; // ✅ new 
	private double gstAmount;
	private double gst; // ✅ new 
	private double consultationFee; 
	private double finalCost; 
	private double totalDiscountAmount; 
	private double totalDiscountPercentage; 
	private double ngkDiscountAmount; 
	private double ngkDiscountPercentage; 
	
}