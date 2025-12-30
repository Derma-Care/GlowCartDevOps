package com.glowkart.customer.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.glowkart.customer.enums.RewardReason;
import com.glowkart.customer.enums.RewardTransactionType;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.model.RewardTransaction;
import com.glowkart.customer.repo.CustomerRepository;
import com.glowkart.customer.repo.RewardTransactionRepository;

@Service
public class RewardService {

    @Autowired
    private RewardTransactionRepository rewardRepo;

    @Autowired
    private CustomerRepository customerRepo;
    
    // ==================== Apply Registration Reward ====================
    @Transactional
    public void applyRegistrationReward(Customer customer) {
        // Avoid double-credit
        if (customer.isRegistrationRewardGiven()) return;

        int points = RewardReason.REGISTRATION_COMPLETED.getDefaultPoints();
        int updatedBalance = customer.getRewardPoints() + points;

        // Update customer
        customer.setRewardPoints(updatedBalance);
        customer.setRegistrationRewardGiven(true);

        // Save transaction
        RewardTransaction tx = new RewardTransaction();
        tx.setCustomerId(customer.getCustomerId());
        tx.setMobile(customer.getMobile());
        tx.setPoints(points);
        tx.setType(RewardTransactionType.CREDIT);
        tx.setReason(RewardReason.REGISTRATION_COMPLETED);
        tx.setBalanceAfter(updatedBalance);

        rewardRepo.save(tx);
    }
    
    @Transactional
    public void deductPoints(String customerId, int points) {
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
        tx.setReason(RewardReason.REDEEMED_FOR_BOOKING); // You can add a new enum for booking redemption
        tx.setBalanceAfter(updatedBalance);

        rewardRepo.save(tx);
    }
    
    
}
