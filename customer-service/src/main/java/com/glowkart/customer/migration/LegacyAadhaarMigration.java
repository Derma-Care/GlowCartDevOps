package com.glowkart.customer.migration;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.glowkart.customer.model.Customer;
import com.glowkart.customer.repo.CustomerRepository;
import com.glowkart.customer.util.AadhaarUtils;

@Component
public class LegacyAadhaarMigration implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(LegacyAadhaarMigration.class);

    @Autowired
    private CustomerRepository customerRepository;

    @Override
    public void run(String... args) {
        List<Customer> allCustomers = customerRepository.findAll();
        List<Customer> toUpdate = new ArrayList<>();

        for (Customer customer : allCustomers) {
            if (customer.getAadharPreHash() != null) continue; // Already migrated

            if (customer.getAadharLast4() != null && customer.getAadharHash() == null) {
                // Legacy user with only last 4 digits
                String tempPreHash = AadhaarUtils.legacyPreHash(customer.getAadharLast4());
                customer.setAadharPreHash(tempPreHash);

            } else if (customer.getAadharHash() != null && customer.getAadharSalt() != null) {
                // Full Aadhaar already present
                log.info("Full Aadhaar exists for user: {}", customer.getMobile());

            } else {
                // No Aadhaar at all, use default pre-hash + flag to avoid collisions
                String tempPreHash = AadhaarUtils.legacyPreHash("0000");
                customer.setAadharPreHash(tempPreHash);
                // Optional: you could also store a boolean like customer.setHasAadhaar(false);
            }

            toUpdate.add(customer);
        }

        if (!toUpdate.isEmpty()) {
            customerRepository.saveAll(toUpdate);
        }

        log.info("✅ Legacy Aadhaar migration completed. Migrated {} customers.", toUpdate.size());
    }
}
