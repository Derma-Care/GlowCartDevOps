package com.glowkart.customer.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.CompleteRegistrationDTO;
import com.glowkart.customer.dto.CustomerDetailsDTO;
import com.glowkart.customer.dto.ReferralRegistrationDTO;
import com.glowkart.customer.dto.SpinWheelDTO;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.service.CustomerService;

@RestController
@RequestMapping("/api")
//@CrossOrigin("*")
public class CustomerController {

    @Autowired
    private CustomerService userService;
    
    @PostMapping("/customer/step1")
    public ApiResponse<Customer> step1(@RequestBody CustomerDetailsDTO dto) {
        return userService.step1(dto);
    }

    @PostMapping("/customer/{mobile}/spin")
    public ApiResponse<Customer> spin(
            @PathVariable String mobile,
            @RequestBody(required = false) SpinWheelDTO dto) {
        return userService.spin(mobile, dto);
    }

    @PostMapping("/customer/{mobile}/complete")
    public ApiResponse<Map<String, Object>> complete(
            @PathVariable String mobile,
            @RequestBody CompleteRegistrationDTO dto) {
        return userService.completeRegistration(mobile, dto);
    }

    @GetMapping("/customer/{mobile}/wheel-slices")
    public ApiResponse<Map<String, Object>> wheelSlices(@PathVariable String mobile) {
        return userService.getWheelSlices(mobile);
    }

    @GetMapping("/customer/all")
    public ApiResponse<List<Customer>> allCustomers() {
        return userService.getAllCustomers();
    }

    @GetMapping("/customer/{mobile}")
    public ApiResponse<Customer> getCustomer(@PathVariable String mobile) {
        return userService.getCustomer(mobile);
    }

    @GetMapping("/customer/id/{customerId}")
    public ApiResponse<Customer> getCustomerById(@PathVariable String customerId) {
        return userService.getCustomerById(customerId);
    }

    @GetMapping("/customer/code/{code}")
    public ApiResponse<Customer> getCustomerByCode(@PathVariable String code) {
        return userService.getCustomerByCode(code);
    }

    @DeleteMapping("/customer/{mobile}")
    public ApiResponse<String> delete(@PathVariable String mobile) {
        return userService.deleteCustomer(mobile);
    }

    @GetMapping("/customer/cities")
    public ApiResponse<List<String>> cities() {
        return userService.getCities();
    }

    @GetMapping("/customer/referral/{referId}/validate")
    public ApiResponse<String> validateReferral(@PathVariable String referId) {
        return userService.validateReferral(referId);
    }

    @GetMapping("/customer/referral/{referId}/verify")
    public ApiResponse<Void> verifyReferral(@PathVariable String referId) {
        return userService.verifyReferral(referId);
    }

    @PostMapping("/customer/referral/register")
    public ApiResponse<Map<String, Object>> registerViaReferral(
            @RequestBody ReferralRegistrationDTO dto) {
        return userService.registerViaReferral(dto);
    }

    @PutMapping("/customer/{mobile}/device-token")
    public ApiResponse<Void> updateDeviceToken(
            @PathVariable String mobile,
            @RequestParam String deviceToken) {
        return userService.updateDeviceToken(mobile, deviceToken);
    }
}
