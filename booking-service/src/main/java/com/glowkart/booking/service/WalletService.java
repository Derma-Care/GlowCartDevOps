package com.glowkart.booking.service;

import com.glowkart.booking.client.CustomerRewardsClient;
import com.glowkart.booking.dto.RewardTransactionDTO;
import com.glowkart.booking.dto.WalletSummaryDTO;
import com.glowkart.booking.dto.ApiResponse;
import com.glowkart.booking.exception.WalletOperationException;
import com.glowkart.booking.exception.WalletServiceException;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class WalletService {

	    private final CustomerRewardsClient customerRewardsClient;

	    public WalletService(CustomerRewardsClient customerRewardsClient) {
	        this.customerRewardsClient = customerRewardsClient;
	    }

	    public WalletSummaryDTO getWalletSummary(String mobile) {
	        ApiResponse<WalletSummaryDTO> response =
	                customerRewardsClient.getWalletSummary(mobile);

	        if (!response.isSuccess() || response.getData() == null) {
	            throw new WalletServiceException(
	                    response.getMessage(),
	                    response.getStatusCode()
	            );
	        }
	        return response.getData();
	    }

	    public List<RewardTransactionDTO> getTransactions(String mobile, String filter) {
	        ApiResponse<List<RewardTransactionDTO>> response =
	                customerRewardsClient.getTransactions(mobile, filter);

	        if (!response.isSuccess()) {
	            throw new WalletServiceException(
	                    response.getMessage(),
	                    response.getStatusCode()
	            );
	        }
	        return response.getData();
	    }

	    public void redeemPoints(String customerId, int points) {
	        if (points <= 0) {
	            throw new WalletServiceException("Points must be greater than 0", 400);
	        }

	        ApiResponse<Void> response =
	                customerRewardsClient.deductPoints(customerId, points);

	        if (!response.isSuccess()) {
	            throw new WalletServiceException(
	                    response.getMessage(),
	                    response.getStatusCode()
	            );
	        }
	    }
	}

