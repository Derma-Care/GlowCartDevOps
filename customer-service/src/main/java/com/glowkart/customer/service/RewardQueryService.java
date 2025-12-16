package com.glowkart.customer.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.glowkart.customer.dto.RewardTransactionDTO;
import com.glowkart.customer.dto.WalletSummaryDTO;
import com.glowkart.customer.enums.RewardTransactionType;
import com.glowkart.customer.model.RewardTransaction;
import com.glowkart.customer.repo.RewardTransactionRepository;

@Service
public class RewardQueryService {

    @Autowired
    private RewardTransactionRepository rewardRepo;

    public WalletSummaryDTO getWalletSummary(String mobile) {
        int totalCredits = rewardRepo.findByMobileAndType(mobile, RewardTransactionType.CREDIT)
                                     .stream().mapToInt(RewardTransaction::getPoints).sum();

        int totalDebits = rewardRepo.findByMobileAndType(mobile, RewardTransactionType.DEBIT)
                                    .stream().mapToInt(RewardTransaction::getPoints).sum();

        int balance = totalCredits - totalDebits;

        return new WalletSummaryDTO(totalCredits, totalDebits, balance);
    }

    public List<RewardTransactionDTO> getTransactions(String mobile, String filter) {
        // Fetch all transactions for this mobile
        List<RewardTransaction> txs = rewardRepo.findByMobileOrderByCreatedAtDesc(mobile);

        // Normalize filter string
        String normalizedFilter = filter == null ? "all" : filter.trim().toLowerCase();

        // Filter only if it's credit or debit
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
