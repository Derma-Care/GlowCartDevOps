package com.glowkart.customer.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.glowkart.customer.dto.RewardTransactionDTO;
import com.glowkart.customer.dto.WalletSummaryDTO;
import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.service.RewardQueryService;
import com.glowkart.customer.service.RewardService;

@RestController
@RequestMapping("/api")
public class RewardController {

    @Autowired
    private RewardQueryService rewardQueryService;

    @Autowired
    private RewardService userRewardService;

    // Deduct reward points
    @PostMapping("/rewards/{customerId}/deduct")
    public ApiResponse<Void> deductPoints(
            @PathVariable String customerId,
            @RequestParam int points) {
        return userRewardService.deductPoints(customerId, points);
    }
    
    /**
     * Credit reward points for a completed booking
     */
    @PostMapping("/rewards/{customerId}/credit")
    public ApiResponse<Void> creditBookingReward(
            @PathVariable String customerId,
            @RequestParam String bookingId,
            @RequestParam double bookingAmount) {

        // Calculate points in customer-service and forward the points to reward-service
        return userRewardService.creditPoints(customerId, bookingId, bookingAmount);
    }


    // Get wallet summary
    @GetMapping("/rewards/{mobile}/wallet")
    public ApiResponse<WalletSummaryDTO> getWalletSummary(
            @PathVariable String mobile) {
        return userRewardService.getWalletSummary(mobile);
    }

    // Get reward transactions
    @GetMapping("/rewards/{mobile}/transactions")
    public ApiResponse<List<RewardTransactionDTO>> getTransactions(
            @PathVariable String mobile,
            @RequestParam(value = "filter", required = false, defaultValue = "all")
            String filter) {
        return userRewardService.getTransactions(mobile, filter);
    }
}
