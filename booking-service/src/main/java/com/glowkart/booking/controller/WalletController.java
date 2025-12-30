package com.glowkart.booking.controller;

import com.glowkart.booking.dto.ApiResponse;
import com.glowkart.booking.dto.RewardTransactionDTO;
import com.glowkart.booking.dto.WalletSummaryDTO;
import com.glowkart.booking.service.WalletService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/booking")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    // =================== Wallet Summary ===================
    @GetMapping("/customer/wallet/{mobile}/summary")
    public ApiResponse<WalletSummaryDTO> getWalletSummary(@PathVariable String mobile) {
        WalletSummaryDTO summary = walletService.getWalletSummary(mobile);
        return ApiResponse.<WalletSummaryDTO>builder()
                .success(true)
                .message("Wallet summary fetched successfully")
                .data(summary)
                .build();
    }

    // =================== Transactions ===================
    @GetMapping("/customer/wallet/{mobile}/transactions")
    public ApiResponse<List<RewardTransactionDTO>> getTransactions(
            @PathVariable String mobile,
            @RequestParam(value = "filter", defaultValue = "all") String filter) {
        List<RewardTransactionDTO> transactions = walletService.getTransactions(mobile, filter);
        return ApiResponse.<List<RewardTransactionDTO>>builder()
                .success(true)
                .message("Transactions fetched successfully")
                .data(transactions)
                .build();
    }

    // =================== Redeem Points ===================
    @PostMapping("/customer/wallet/{customerId}/redeem")
    public ApiResponse<Void> redeemPoints(
            @PathVariable String customerId,
            @RequestParam int points) {
        walletService.redeemPoints(customerId, points);
        return ApiResponse.<Void>builder()
                .success(true)
                .message(points + " points redeemed successfully")
                .build();
    }
}
