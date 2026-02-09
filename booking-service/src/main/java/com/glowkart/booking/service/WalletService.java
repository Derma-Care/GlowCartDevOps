package com.glowkart.booking.service;

import com.glowkart.booking.client.CustomerRewardsClient;
import com.glowkart.booking.dto.ApiResponse;
import com.glowkart.booking.dto.RewardTransactionDTO;
import com.glowkart.booking.dto.WalletSummaryDTO;
import com.glowkart.booking.exception.WalletServiceException;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class WalletService {

    private final CustomerRewardsClient customerRewardsClient;

    public WalletService(CustomerRewardsClient customerRewardsClient) {
        this.customerRewardsClient = customerRewardsClient;
    }

    // ================= FETCH WALLET =================
    public WalletSummaryDTO getWalletSummary(String mobile) {

        ApiResponse<WalletSummaryDTO> response =
                customerRewardsClient.getWalletSummary(mobile);

        if (!response.isSuccess() || response.getData() == null) {
            throw new WalletServiceException(
                    response.getMessage(),
                    response.getStatusCode()
            );
        }

        // ✅ Booking-service does NOT compute reward logic
        return response.getData();
    }


    // ================= FETCH TRANSACTIONS =================
    public List<RewardTransactionDTO> getTransactions(String mobile, String filter) {

        ApiResponse<List<RewardTransactionDTO>> response =
                customerRewardsClient.getTransactions(mobile, filter);

        if (!response.isSuccess()) {
            throw new WalletServiceException(
                    response.getMessage() != null ? response.getMessage() : "Failed to fetch transactions",
                    response.getStatusCode()
            );
        }

        return response.getData();
    }

 // ================= REDEEM POINTS =================
    public void redeemPoints(
            String customerId,
            String mobile,
            int points,
            double bookingAmount
    ) {
        if (points <= 0) {
            throw new WalletServiceException("Points must be greater than 0", 400);
        }

        // Fetch fresh wallet snapshot
        WalletSummaryDTO wallet = getWalletSummary(mobile);

        int balance = wallet.getBalance();

        // Validate balance
        if (points > balance) {
            throw new WalletServiceException("Insufficient points to redeem", 400);
        }

        // Validate against 50% wallet rule
        int maxRedeemablePoints = calculateMaxRedeemablePoints(wallet);
        if (points > maxRedeemablePoints) {
            throw new WalletServiceException(
                    "You can redeem a maximum of " + maxRedeemablePoints + " points for this booking",
                    400
            );
        }

        // Deduct points
        ApiResponse<Void> response = customerRewardsClient.deductPoints(customerId, points);

        if (!response.isSuccess()) {
            throw new WalletServiceException(
                    response.getMessage() != null ? response.getMessage() : "Failed to redeem points",
                    response.getStatusCode()
            );
        }

        log.info("Redeemed {} points for customerId={}", points, customerId);
    }


 // ================= HELPERS =================
    /**
     * Calculates maximum redeemable points based on wallet rules.
     * Rule: Maximum 50% of available wallet points can be redeemed per booking.
     */
    private int calculateMaxRedeemablePoints(WalletSummaryDTO wallet) {
        return wallet.getBalance() / 2; // 50% of available points
    }

}
