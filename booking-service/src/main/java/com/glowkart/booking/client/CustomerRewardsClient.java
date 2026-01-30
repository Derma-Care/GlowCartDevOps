package com.glowkart.booking.client;

import com.glowkart.booking.dto.ApiResponse;
import com.glowkart.booking.dto.RewardTransactionDTO;
import com.glowkart.booking.dto.WalletSummaryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "customer-service", contextId = "customerRewardsClient", url = "http://3.111.202.212:8080" )
public interface CustomerRewardsClient {

    @GetMapping("/api/rewards/{mobile}/wallet")
    ApiResponse<WalletSummaryDTO> getWalletSummary(@PathVariable("mobile") String mobile);

    @GetMapping("/api/rewards/{mobile}/transactions")
    ApiResponse<List<RewardTransactionDTO>> getTransactions(
            @PathVariable("mobile") String mobile,
            @RequestParam(value = "filter", required = false, defaultValue = "all") String filter
    );

    @PostMapping("/api/rewards/{customerId}/deduct")
    ApiResponse<Void> deductPoints(@PathVariable("customerId") String customerId,
                                         @RequestParam("points") int points);
}
