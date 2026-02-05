package com.glowkart.customer.feign;

import java.util.List;
import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.CompleteRegistrationDTO;
import com.glowkart.customer.dto.CustomerDetailsDTO;
import com.glowkart.customer.dto.ReferralRegistrationDTO;
import com.glowkart.customer.dto.RewardTransactionDTO;
import com.glowkart.customer.dto.SpinWheelDTO;
import com.glowkart.customer.dto.WalletSummaryDTO;
import com.glowkart.customer.model.Customer;

@FeignClient(name = "customer-service", url = "http://3.111.202.212:8080")
public interface CustomerClient {


    // STEP 1
    @PostMapping("/api/customer/step1")
    ApiResponse<Customer> step1(@RequestBody CustomerDetailsDTO dto);

    // STEP 2
    @PostMapping("/api/customer/{mobile}/spin")
    ApiResponse<Customer> spin(
            @PathVariable String mobile,
            @RequestBody(required = false) SpinWheelDTO dto
    );

    // STEP 3
    @PostMapping("/api/customer/{mobile}/complete")
    ApiResponse<Map<String, Object>> completeRegistration(
            @PathVariable String mobile,
            @RequestBody CompleteRegistrationDTO dto
    );

    // Wheel slices
    @GetMapping("/api/customer/{mobile}/wheel-slices")
    ApiResponse<Map<String, Object>> getWheelSlices(@PathVariable String mobile);

    // CRUD
    @GetMapping("/api/customer/all")
    ApiResponse<List<Customer>> getAllCustomers();

    @GetMapping("/api/customer/{mobile}")
    ApiResponse<Customer> getCustomer(@PathVariable String mobile);

    @GetMapping("/api/customer/id/{customerId}")
    ApiResponse<Customer> getCustomerById(@PathVariable String customerId);

    @GetMapping("/api/customer/code/{registrationCode}")
    ApiResponse<Customer> getCustomerByCode(@PathVariable String registrationCode);

    @DeleteMapping("/api/customer/{mobile}")
    ApiResponse<String> deleteCustomer(@PathVariable String mobile);

    // Cities
    @GetMapping("/api/customer/cities")
    ApiResponse<List<String>> getCities();

    // Referral
    @GetMapping("/api/customer/referral/{referId}/validate")
    ApiResponse<String> validateReferral(@PathVariable String referId);

    @GetMapping("/api/customer/referral/{referId}/verify")
    ApiResponse<Void> verifyReferral(@PathVariable String referId);

    @PostMapping("/api/customer/referral/register")
    ApiResponse<Map<String, Object>> registerViaReferral(
            @RequestBody ReferralRegistrationDTO dto
    );

    // Device token
    @PutMapping("/api/customer/{mobile}/device-token")
    ApiResponse<Void> updateDeviceToken(
            @PathVariable String mobile,
            @RequestParam String deviceToken
    );
    
    
    // Deduct points
    @PostMapping("/api/rewards/{customerId}/deduct")
    ApiResponse<Void> deductPoints(
            @PathVariable String customerId,
            @RequestParam int points
    );
    
 // Credit points
    @PostMapping("/api/rewards/{customerId}/credit")
    ApiResponse<Void> creditPoints(
            @PathVariable String customerId,
            @RequestParam int points
    );


    // Wallet summary
    @GetMapping("/api/rewards/{mobile}/wallet")
    ApiResponse<WalletSummaryDTO> getWalletSummary(
            @PathVariable String mobile
    );

    // Transactions
    @GetMapping("/api/rewards/{mobile}/transactions")
    ApiResponse<List<RewardTransactionDTO>> getTransactions(
            @PathVariable String mobile,
            @RequestParam(value = "filter", required = false, defaultValue = "all")
            String filter
    );
}
