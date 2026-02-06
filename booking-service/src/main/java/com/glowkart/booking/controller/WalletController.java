package com.glowkart.booking.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.booking.client.CustomerInfoClient;
import com.glowkart.booking.dto.ApiResponse;
import com.glowkart.booking.dto.CustomerDTO;
import com.glowkart.booking.dto.RewardTransactionDTO;
import com.glowkart.booking.dto.WalletSummaryDTO;
import com.glowkart.booking.service.WalletService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/booking")
public class WalletController {


    private final CustomerInfoClient customerInfoClient;
    
    private final WalletService walletService;

    // Constructor now accepts both walletService and customerInfoClient
    public WalletController(WalletService walletService, CustomerInfoClient customerInfoClient) {
        this.walletService = walletService;
        this.customerInfoClient = customerInfoClient;
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
            @RequestParam int points,
            @RequestParam double bookingAmount) {

        // ✅ Fetch customer via Feign to get mobile
        ApiResponse<CustomerDTO> customerResponse =
        		customerInfoClient.getCustomerId(customerId);

        if (!customerResponse.isSuccess() || customerResponse.getData() == null) {
            throw new RuntimeException("Customer not found with id: " + customerId);
        }

        CustomerDTO customer = customerResponse.getData();

        // ✅ Fetch wallet using MOBILE
        WalletSummaryDTO walletSummary =
                walletService.getWalletSummary(customer.getMobile());

        String membership = walletSummary.getMembership();

        // ✅ Redeem points
        walletService.redeemPoints(
                customerId,
                customer.getMobile(),
                points,
                bookingAmount
//                membership
        );

        return ApiResponse.<Void>builder()
                .success(true)
                .message(points + " points redeemed successfully")
                .build();
    }


}
