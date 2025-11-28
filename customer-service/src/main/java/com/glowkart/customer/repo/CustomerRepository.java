package com.glowkart.customer.repo;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.glowkart.customer.model.Customer;

public interface CustomerRepository extends MongoRepository<Customer, String> {

    Optional<Customer> findByMobile(String mobile);
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByAadharHash(String aadharHash);

	Customer findByRegistrationCode(String code);
}
