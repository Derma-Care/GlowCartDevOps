package com.glowkart.admin.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.glowkart.admin.client.CustomerServiceClient;
import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.CustomerResponseDTO;
import com.glowkart.admin.exception.ResourceNotFoundException;

@Service
public class AdminCustomerService {

    @Autowired
    private CustomerServiceClient customerServiceClient;

    public List<CustomerResponseDTO> getAllCustomers() {
        ApiResponse<List<CustomerResponseDTO>> response = customerServiceClient.getAllCustomers();
        return (response.getData() != null) ? response.getData() : new ArrayList<>();
    }


    public CustomerResponseDTO getCustomerByMobile(String mobile) {
        ApiResponse<CustomerResponseDTO> response = customerServiceClient.getCustomer(mobile);
        if (!response.isSuccess() || response.getData() == null) {
            throw new ResourceNotFoundException("Customer not found with mobile: " + mobile);
        }
        return response.getData();
    }

    public void deleteCustomer(String mobile) {
        ApiResponse<String> response = customerServiceClient.deleteCustomer(mobile);
        if (!response.isSuccess()) {
            throw new ResourceNotFoundException("Customer not found or cannot delete: " + mobile);
        }
    }
}
