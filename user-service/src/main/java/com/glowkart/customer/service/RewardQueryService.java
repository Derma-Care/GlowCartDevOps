package com.glowkart.customer.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.glowkart.customer.dto.RewardTransactionDTO;
import com.glowkart.customer.dto.WalletSummaryDTO;
import com.glowkart.customer.enums.RewardTransactionType;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.model.RewardTransaction;
import com.glowkart.customer.repo.CustomerRepository;
import com.glowkart.customer.repo.RewardTransactionRepository;
import com.glowkart.customer.exception.CustomerNotFoundException;

@Service
public class RewardQueryService {

    @Autowired
    private RewardTransactionRepository rewardRepo;

    @Autowired
    private CustomerRepository customerRepo;

    /**
     * Get wallet summary for a customer by mobile number
     */
    public WalletSummaryDTO getWalletSummary(String mobile) {
        // 1️⃣ Check if customer exists
        Customer customer = customerRepo.findByMobile(mobile)
                .orElseThrow(() -> new CustomerNotFoundException(
                        "Customer not found with mobile: " + mobile
                ));

        // 2️⃣ Calculate total credits
        int totalCredits = rewardRepo.findByMobileAndType(mobile, RewardTransactionType.CREDIT)
                                     .stream()
                                     .mapToInt(RewardTransaction::getPoints)
                                     .sum();

        // 3️⃣ Calculate total debits
        int totalDebits = rewardRepo.findByMobileAndType(mobile, RewardTransactionType.DEBIT)
                                    .stream()
                                    .mapToInt(RewardTransaction::getPoints)
                                    .sum();

        // 4️⃣ Calculate balance
        int balance = totalCredits - totalDebits;

        // 5️⃣ Build WalletSummaryDTO including reward flags
        return WalletSummaryDTO.builder()
                .totalCredits(totalCredits)
                .totalDebits(totalDebits)
                .balance(balance)
                .registrationRewardGiven(customer.isRegistrationRewardGiven())
                .referralRewardGiven(customer.isReferralRewardGiven())  // or referralRewardReceived if you track referrer
                .build();
    }


    /**
     * Get reward transactions with optional filter
     * @param mobile Customer mobile
     * @param filter Optional query param: credit | debit | all
     */
    public List<RewardTransactionDTO> getTransactions(String mobile, String filter) {
        // Check if customer exists
        Customer customer = customerRepo.findByMobile(mobile)
                .orElseThrow(() -> new CustomerNotFoundException(
                        "Customer not found with mobile: " + mobile
                ));

        // Fetch all transactions for this mobile
        List<RewardTransaction> txs = rewardRepo.findByMobileOrderByCreatedAtDesc(mobile);

        // Normalize filter string
        String normalizedFilter = filter == null ? "all" : filter.trim().toLowerCase();

        // Filter transactions if requested
        if ("credit".equals(normalizedFilter)) {
            txs = txs.stream()
                     .filter(t -> t.getType() == RewardTransactionType.CREDIT)
                     .collect(Collectors.toList());
        } else if ("debit".equals(normalizedFilter)) {
            txs = txs.stream()
                     .filter(t -> t.getType() == RewardTransactionType.DEBIT)
                     .collect(Collectors.toList());
        }
        // else "all" → no filtering

        // Map to DTO
        return txs.stream()
                  .map(t -> new RewardTransactionDTO(
                          t.getId(),
                          t.getPoints(),
                          t.getType().name(),
                          t.getReason().name(),
                          t.getBalanceAfter(),
                          t.getCreatedAt()
                  ))
                  .collect(Collectors.toList());
    }
}
