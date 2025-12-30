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
    private RewardService rewardService;

    @PostMapping("/rewards/{customerId}/deduct")
    public ResponseEntity<ApiResponse<Void>> deductPoints(
            @PathVariable String customerId,
            @RequestParam int points) {

        try {
            rewardService.deductPoints(customerId, points);
            return ResponseEntity.ok(new ApiResponse<>(true, "Points deducted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Get wallet summary for a customer
     * Throws 404 if customer does not exist
     */
    @GetMapping("/rewards/{mobile}/wallet")
    public ResponseEntity<ApiResponse<WalletSummaryDTO>> getWalletSummary(
            @PathVariable String mobile) {

        WalletSummaryDTO walletSummary = rewardQueryService.getWalletSummary(mobile);
        return ResponseEntity.ok(new ApiResponse<>(true, "Wallet summary fetched successfully", walletSummary));
    }

    /**
     * Get reward transactions with optional filter
     * Throws 404 if customer does not exist
     */
    @GetMapping("/rewards/{mobile}/transactions")
    public ResponseEntity<ApiResponse<List<RewardTransactionDTO>>> getTransactions(
            @PathVariable String mobile,
            @RequestParam(value = "filter", required = false, defaultValue = "all") String filter) {

        List<RewardTransactionDTO> transactions = rewardQueryService.getTransactions(mobile, filter);
        return ResponseEntity.ok(new ApiResponse<>(true, "Transactions fetched successfully", transactions));
    }
}
