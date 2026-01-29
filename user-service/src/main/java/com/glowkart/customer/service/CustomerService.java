package com.glowkart.customer.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.CompleteRegistrationDTO;
import com.glowkart.customer.dto.CustomerDetailsDTO;
import com.glowkart.customer.dto.ReferralRegistrationDTO;
import com.glowkart.customer.dto.SpinWheelDTO;
import com.glowkart.customer.feign.CustomerClient;
import com.glowkart.customer.model.Customer;

@Service
public class CustomerService {

	@Autowired
    private CustomerClient customerFeignClient;

    public ApiResponse<Customer> step1(CustomerDetailsDTO dto) {
        return customerFeignClient.step1(dto);
    }

    public ApiResponse<Customer> spin(String mobile, SpinWheelDTO dto) {
        return customerFeignClient.spin(mobile, dto);
    }

    public ApiResponse<Map<String, Object>> completeRegistration(
            String mobile,
            CompleteRegistrationDTO dto) {
        return customerFeignClient.completeRegistration(mobile, dto);
    }

    public ApiResponse<Map<String, Object>> getWheelSlices(String mobile) {
        return customerFeignClient.getWheelSlices(mobile);
    }

    public ApiResponse<List<Customer>> getAllCustomers() {
        return customerFeignClient.getAllCustomers();
    }

    public ApiResponse<Customer> getCustomer(String mobile) {
        return customerFeignClient.getCustomer(mobile);
    }

    public ApiResponse<Customer> getCustomerById(String customerId) {
        return customerFeignClient.getCustomerById(customerId);
    }

    public ApiResponse<Customer> getCustomerByCode(String code) {
        return customerFeignClient.getCustomerByCode(code);
    }

    public ApiResponse<String> deleteCustomer(String mobile) {
        return customerFeignClient.deleteCustomer(mobile);
    }

    public ApiResponse<List<String>> getCities() {
        return customerFeignClient.getCities();
    }

    public ApiResponse<String> validateReferral(String referId) {
        return customerFeignClient.validateReferral(referId);
    }

    public ApiResponse<Void> verifyReferral(String referId) {
        return customerFeignClient.verifyReferral(referId);
    }

    public ApiResponse<Map<String, Object>> registerViaReferral(
            ReferralRegistrationDTO dto) {
        return customerFeignClient.registerViaReferral(dto);
    }

    public ApiResponse<Void> updateDeviceToken(String mobile, String deviceToken) {
        return customerFeignClient.updateDeviceToken(mobile, deviceToken);
    }

}
