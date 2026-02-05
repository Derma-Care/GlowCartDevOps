package com.glowkart.customer.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.RewardTransactionDTO;
import com.glowkart.customer.dto.WalletSummaryDTO;
import com.glowkart.customer.feign.CustomerClient;

@Service
public class RewardService {

	   @Autowired
	    private CustomerClient rewardFeignClient;
	   
    public ApiResponse<Void> deductPoints(String customerId, int points) {
        return rewardFeignClient.deductPoints(customerId, points);
    }
    
    // New method for crediting points
    public ApiResponse<Void> creditPoints(String customerId, int points) {
        return rewardFeignClient.creditPoints(customerId, points);
    }

    public ApiResponse<WalletSummaryDTO> getWalletSummary(String mobile) {
        return rewardFeignClient.getWalletSummary(mobile);
    }

    public ApiResponse<List<RewardTransactionDTO>> getTransactions(
            String mobile,
            String filter) {
        return rewardFeignClient.getTransactions(mobile, filter);
    }

}
