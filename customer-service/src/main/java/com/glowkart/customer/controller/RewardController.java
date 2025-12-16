package com.glowkart.customer.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.glowkart.customer.dto.RewardTransactionDTO;
import com.glowkart.customer.dto.WalletSummaryDTO;
import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.service.RewardQueryService;

@RestController
@RequestMapping("/api")
public class RewardController {

    @Autowired
    private RewardQueryService rewardQueryService;

    /**
     * Get wallet summary for a customer
     */
    @GetMapping("/rewards/{mobile}/wallet")
    public ResponseEntity<ApiResponse<WalletSummaryDTO>> getWalletSummary(
            @PathVariable String mobile) {

        WalletSummaryDTO walletSummary = rewardQueryService.getWalletSummary(mobile);
        return ResponseEntity.ok(new ApiResponse<>(true, "Wallet summary fetched successfully", walletSummary));
    }

    /**
     * Get reward transactions with optional filter
     * @param mobile Customer mobile
     * @param filter Optional query param: credit | debit | all
     */
    @GetMapping("/rewards/{mobile}/transactions")
    public ResponseEntity<ApiResponse<List<RewardTransactionDTO>>> getTransactions(
            @PathVariable String mobile,
            @RequestParam(value = "filter", required = false, defaultValue = "all") String filter) {

        List<RewardTransactionDTO> transactions = rewardQueryService.getTransactions(mobile, filter);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Transactions fetched successfully", transactions)
        );
    }
}
