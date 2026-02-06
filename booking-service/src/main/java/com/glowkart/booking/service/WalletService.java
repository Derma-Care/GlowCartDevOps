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

        // Always fetch fresh wallet snapshot
        WalletSummaryDTO wallet = getWalletSummary(mobile);

        int balance = wallet.getBalance();
        int coinValue = wallet.getCoinValue(); // 🔥 owned by customer-service

        // Validate balance
        if (points > balance) {
            throw new WalletServiceException("Insufficient points to redeem", 400);
        }

        // Enforce 50% booking rule
        int maxRedeemablePoints = calculateMaxRedeemablePoints(bookingAmount, coinValue);
        if (points > maxRedeemablePoints) {
            throw new WalletServiceException(
                    "You can redeem a maximum of " + maxRedeemablePoints + " points for this booking",
                    400
            );
        }

        // Deduct points
        ApiResponse<Void> response =
                customerRewardsClient.deductPoints(customerId, points);

        if (!response.isSuccess()) {
            throw new WalletServiceException(
                    response.getMessage() != null ? response.getMessage() : "Failed to redeem points",
                    response.getStatusCode()
            );
        }

        log.info("Redeemed {} points for customerId={}", points, customerId);
    }

    // ================= HELPERS =================
    private int calculateMaxRedeemablePoints(double bookingAmount, int coinValue) {
        double maxDiscountAllowed = bookingAmount * 0.5;
        return (int) (maxDiscountAllowed / coinValue);
    }
}
