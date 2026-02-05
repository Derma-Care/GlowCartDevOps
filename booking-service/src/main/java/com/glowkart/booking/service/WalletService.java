package com.glowkart.booking.service;

import com.glowkart.booking.client.CustomerRewardsClient;
import com.glowkart.booking.dto.RewardTransactionDTO;
import com.glowkart.booking.dto.WalletSummaryDTO;
import com.glowkart.booking.dto.ApiResponse;
import com.glowkart.booking.exception.WalletServiceException;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.LinkedHashMap;
import java.util.List;

@Service
@Slf4j
public class WalletService {

    private final CustomerRewardsClient customerRewardsClient;

    public WalletService(CustomerRewardsClient customerRewardsClient) {
        this.customerRewardsClient = customerRewardsClient;
    }

    /**
     * Get wallet summary for a customer, with pre-calculated coin value and membership level.
     */
    public WalletSummaryDTO getWalletSummary(String mobile) {
        ApiResponse<WalletSummaryDTO> response =
                customerRewardsClient.getWalletSummary(mobile);

        if (!response.isSuccess() || response.getData() == null) {
            throw new WalletServiceException(
                    response.getMessage(),
                    response.getStatusCode()
            );
        }

        WalletSummaryDTO wallet = response.getData();

        // ✅ Calculate everything in one place
        wallet.calculateDerivedFields();

        // ✅ Membership must be based on computed balance
        wallet.setMembership(determineMembership(wallet.getTotalCredits()));

        // Set the membership levels (thresholds for each level) with correct order
        wallet.setLevels(getSortedMembershipLevels());  // Using a LinkedHashMap to keep order

        return wallet;
    }

    /**
     * Determines membership level based on the number of points.
     */
    private String determineMembership(int points) {
        if (points >= 7500) {
            return "PLATINUM";
        } else if (points >= 5000) {
            return "GOLD";
        } else if (points >= 2500) {
            return "SILVER";
        }
        return "BASIC";
    }

    /**
     * Fetch the coin value for a given membership.
     */
    public int getCoinValueForMembership(String membership) {
        switch (membership) {
            case "PLATINUM":
                return 4;
            case "GOLD":
                return 3;
            case "SILVER":
                return 2;
            default:
                return 1;  // BASIC
        }
    }

    /**
     * Fetch reward transactions for a customer.
     */
    public List<RewardTransactionDTO> getTransactions(String mobile, String filter) {
        ApiResponse<List<RewardTransactionDTO>> response = customerRewardsClient.getTransactions(mobile, filter);

        if (!response.isSuccess()) {
            throw new WalletServiceException(
                    response.getMessage() != null ? response.getMessage() : "Failed to fetch transactions",
                    response.getStatusCode()
            );
        }
        return response.getData();
    }

    /**
     * Redeem points from the customer wallet.
     * Ensures points are redeemable within the constraints and verifies balance.
     */
    public void redeemPoints(
            String customerId,
            String mobile,
            int points,
            double bookingAmount,
            String membership
    ) {
        if (points <= 0) {
            throw new WalletServiceException("Points must be greater than 0", 400);
        }

        // ✅ ALWAYS fetch wallet using MOBILE
        ApiResponse<WalletSummaryDTO> walletResponse =
                customerRewardsClient.getWalletSummary(mobile);

        if (!walletResponse.isSuccess() || walletResponse.getData() == null) {
            throw new WalletServiceException(
                    "Failed to fetch wallet summary",
                    walletResponse.getStatusCode()
            );
        }

        WalletSummaryDTO wallet = walletResponse.getData();

        // ✅ IMPORTANT: recompute derived fields
        wallet.calculateDerivedFields();

        // ✅ Validate balance
        if (points > wallet.getBalance()) {
            throw new WalletServiceException("Insufficient points to redeem", 400);
        }

        // ✅ Enforce 50% rule
        int maxRedeemableCoins = calculateMaxRedeemableCoins(bookingAmount, membership);
        if (points > maxRedeemableCoins) {
            throw new WalletServiceException(
                    "You can redeem a maximum of " + maxRedeemableCoins + " coins for this booking.",
                    400
            );
        }

        // ✅ Deduct points using CUSTOMER ID (correct)
        ApiResponse<Void> response =
                customerRewardsClient.deductPoints(customerId, points);

        if (!response.isSuccess()) {
            throw new WalletServiceException(
                    response.getMessage() != null ? response.getMessage() : "Failed to redeem points",
                    response.getStatusCode()
            );
        }

        log.info("Successfully redeemed {} points for customerId={}", points, customerId);
    }

    /**
     * Calculate maximum redeemable coins based on booking amount and membership level.
     * Only 50% of the booking amount can be redeemed using coins.
     */
    private int calculateMaxRedeemableCoins(double bookingAmount, String membership) {
        int coinValue = getCoinValueForMembership(membership);  // Get coin value based on membership
        double maxRedeemableAmount = bookingAmount * 0.5;  // Maximum 50% of booking amount
        return (int) (maxRedeemableAmount / coinValue);  // Calculate the max redeemable coins
    }

    /**
     * Apply coins to the booking amount and return the remaining amount to be paid.
     * This ensures the user only gets a maximum of 50% off using coins.
     */
    public double applyCoinsToBooking(double bookingAmount, int redeemableCoins, String membership) {
        int coinValue = getCoinValueForMembership(membership);
        double totalRedeemed = redeemableCoins * coinValue;
        return Math.max(bookingAmount - totalRedeemed, 0);  // Ensure the booking amount doesn't go below zero
    }

    /**
     * Returns the membership levels as a LinkedHashMap to ensure the correct order:
     * PLATINUM > GOLD > SILVER > BASIC
     */
    private Map<String, Integer> getSortedMembershipLevels() {
        Map<String, Integer> levels = new LinkedHashMap<>();
        levels.put("PLATINUM", 7500);
        levels.put("GOLD", 5000);
        levels.put("SILVER", 2500);
        levels.put("BASIC", 2499);
        return levels;
    }
}
