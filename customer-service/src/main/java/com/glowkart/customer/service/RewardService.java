package com.glowkart.customer.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.glowkart.customer.enums.RewardReason;
import com.glowkart.customer.enums.RewardTransactionType;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.model.RewardTransaction;
import com.glowkart.customer.repo.RewardTransactionRepository;

@Service
public class RewardService {

    @Autowired
    private RewardTransactionRepository rewardRepo;

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
}
