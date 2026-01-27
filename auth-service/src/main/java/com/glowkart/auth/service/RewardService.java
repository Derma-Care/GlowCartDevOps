package com.glowkart.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.glowkart.auth.enums.RewardReason;
import com.glowkart.auth.enums.RewardTransactionType;
import com.glowkart.auth.model.Customer;
import com.glowkart.auth.model.RewardTransaction;
import com.glowkart.auth.repo.CustomerRepository;
import com.glowkart.auth.repo.RewardTransactionRepository;

import java.util.ArrayList;

@Service
public class RewardService {

    @Autowired
    private RewardTransactionRepository rewardRepo;

    @Autowired
    private CustomerRepository customerRepo;
    
    // ==================== Apply Registration Reward ====================
    @Transactional
    public RewardTransaction applyRegistrationReward(Customer customer) {
        // Check transaction history instead of boolean
        if (rewardRepo.existsByCustomerIdAndReason(customer.getCustomerId(), RewardReason.REGISTRATION_COMPLETED)) {
            return null; // already rewarded
        }

        int points = RewardReason.REGISTRATION_COMPLETED.getDefaultPoints();
        int updatedBalance = customer.getRewardPoints() + points;

        customer.setRewardPoints(updatedBalance);
        customerRepo.save(customer);

        RewardTransaction tx = new RewardTransaction();
        tx.setCustomerId(customer.getCustomerId());
        tx.setMobile(customer.getMobile());
        tx.setPoints(points);
        tx.setType(RewardTransactionType.CREDIT);
        tx.setReason(RewardReason.REGISTRATION_COMPLETED);
        tx.setBalanceAfter(updatedBalance);

        rewardRepo.save(tx);
        return tx;
    }
    
    // ==================== Deduct Points ====================
    @Transactional
    public RewardTransaction deductPoints(String customerId, int points) {
        if (points <= 0) throw new IllegalArgumentException("Points to deduct must be positive");

        Customer customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        int currentBalance = customer.getRewardPoints();
        if (points > currentBalance) {
            throw new IllegalArgumentException("Insufficient reward points");
        }

        int updatedBalance = currentBalance - points;
        customer.setRewardPoints(updatedBalance);
        customerRepo.save(customer);

        RewardTransaction tx = new RewardTransaction();
        tx.setCustomerId(customer.getCustomerId());
        tx.setMobile(customer.getMobile());
        tx.setPoints(points);
        tx.setType(RewardTransactionType.DEBIT);
        tx.setReason(RewardReason.REDEEMED_FOR_BOOKING);
        tx.setBalanceAfter(updatedBalance);

        rewardRepo.save(tx);
        return tx;
    }
    
    // ==================== Apply Referral Reward ====================
    @Transactional
    public RewardTransaction applyReferralReward(Customer referrer, Customer newCustomer) {
        if (referrer == null || newCustomer == null) return null;

        // Initialize referredCustomerIds if null
        if (referrer.getReferredCustomerIds() == null) {
            referrer.setReferredCustomerIds(new ArrayList<>());
        }

        // Avoid double reward for the same referral
        if (referrer.getReferredCustomerIds().contains(newCustomer.getCustomerId())) {
            return null;
        }

        int points = RewardReason.REFERRAL_BONUS.getDefaultPoints();
        int updatedBalance = referrer.getRewardPoints() + points;

        // Update referrer
        referrer.setRewardPoints(updatedBalance);
        referrer.getReferredCustomerIds().add(newCustomer.getCustomerId());
        customerRepo.save(referrer);

        // Save transaction
        RewardTransaction tx = new RewardTransaction();
        tx.setCustomerId(referrer.getCustomerId());
        tx.setMobile(referrer.getMobile());
        tx.setPoints(points);
        tx.setType(RewardTransactionType.CREDIT);
        tx.setReason(RewardReason.REFERRAL_BONUS);
        tx.setBalanceAfter(updatedBalance);
        tx.setRelatedCustomerId(newCustomer.getCustomerId());

        rewardRepo.save(tx);

        return tx;
    }
}
