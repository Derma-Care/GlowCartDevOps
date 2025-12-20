package com.glowkart.customer.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.glowkart.customer.model.Customer;


public interface CustomerRepository extends MongoRepository<Customer, String> {

    Optional<Customer> findByMobile(String mobile);
  

    // Pre-hash query for duplicate Aadhaar
    List<Customer> findByAadharPreHash(String aadharPreHash);

    Customer findByRegistrationCode(String code);

    // ✅ New method: find all customers with preHash in the given list
    List<Customer> findByAadharPreHashIn(List<String> preHashes);

 // Add this method to your existing CustomerRepository interface

    List<Customer> findAll();


	Object findByReferId(String referId);

}
