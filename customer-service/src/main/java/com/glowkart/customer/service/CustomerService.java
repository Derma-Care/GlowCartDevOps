package com.glowkart.customer.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.CompleteRegistrationDTO;
import com.glowkart.customer.dto.CustomerDetailsDTO;
import com.glowkart.customer.dto.WheelSliceDto;
import com.glowkart.customer.feign.WheelSliceClient;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.repo.CustomerRepository;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private WheelSliceClient wheelSliceClient;

    // ==================== STEP-1: Register Customer ====================
    public ApiResponse<Customer> saveCustomer(CustomerDetailsDTO dto) {
        checkDuplicateMobile(dto.getMobile(), null);
        checkDuplicateEmail(dto.getEmail(), null);
        checkDuplicateAadhar(dto.getAadharNumber(), null);

        Customer customer = new Customer();
        copyStep1Fields(dto, customer);
        customer.setRegistrationStatus(false); // Step-1 incomplete
        customerRepository.save(customer);

        return new ApiResponse<>(true, "Customer registered successfully (Step 1)", customer);
    }

    // ==================== STEP-1: Update basic info ====================
    public ApiResponse<Customer> updateStep1(String mobile, CustomerDetailsDTO dto) {
        Customer customer = customerRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        checkDuplicateMobile(dto.getMobile(), mobile);
        checkDuplicateEmail(dto.getEmail(), mobile);
        checkDuplicateAadhar(dto.getAadharNumber(), mobile);

        copyStep1Fields(dto, customer);
        customerRepository.save(customer);

        return new ApiResponse<>(true, "Step-1 fields updated successfully", customer);
    }

    // ==================== STEP-2: Complete Registration ====================
    public ApiResponse<Customer> completeRegistration(String mobile, CompleteRegistrationDTO dto) {
        Customer customer = customerRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (dto.getSpinRewardId() != null && !dto.getSpinRewardId().isEmpty()) {
            WheelSliceDto slice = wheelSliceClient.getSliceById(dto.getSpinRewardId());
            if (slice != null) {
                customer.setSpinRewardId(slice.getId());
                customer.setSpinRewardValue(slice.getOption());
                customer.setSpinRewardImage(slice.getSrc());
            }
        }

        customer.setPrizePostScreenshot(dto.getPrizePostScreenshot());
        customer.setFollowScreenshot(dto.getFollowScreenshot());
        customer.setAddress(dto.getAddress());
        customer.setRegistrationStatus(true); // Step-2 completed

        customerRepository.save(customer);

        return new ApiResponse<>(true, "Step-2 registration completed/updated successfully", customer);
    }

    // ==================== GET Wheel Slices ====================
    public ApiResponse<List<WheelSliceDto>> getWheelSlices() {
        List<WheelSliceDto> slices = wheelSliceClient.getAllSlices();
        return new ApiResponse<>(true, "Wheel slices fetched successfully", slices);
    }

    // ==================== CRUD Operations ====================
    public ApiResponse<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        if (customers.isEmpty()) {
            return new ApiResponse<>(false, "No customers found", null);
        }
        return new ApiResponse<>(true, "Customers retrieved successfully", customers);
    }

    public ApiResponse<Customer> getCustomer(String mobile) {
        Customer customer = customerRepository.findByMobile(mobile)
                .orElse(null);
        if (customer == null) {
            return new ApiResponse<>(false, "Customer not found", null);
        }
        return new ApiResponse<>(true, "Customer found", customer);
    }

    public ApiResponse<String> deleteCustomer(String mobile) {
        Customer customer = customerRepository.findByMobile(mobile)
                .orElse(null);
        if (customer == null) {
            return new ApiResponse<>(false, "Customer not found", null);
        }
        customerRepository.delete(customer);
        return new ApiResponse<>(true, "Customer deleted successfully", mobile);
    }

    // ==================== Helper Methods ====================
    private void copyStep1Fields(CustomerDetailsDTO dto, Customer customer) {
        customer.setFullName(dto.getFullName());
        customer.setMobile(dto.getMobile());
        customer.setEmail(dto.getEmail());
        customer.setCity(dto.getCity());
        customer.setDob(dto.getDob());
        customer.setClinicName(dto.getClinicName());
        customer.setClinicCityArea(dto.getClinicCityArea());
        customer.setDateOfLastVisit(dto.getDateOfLastVisit());
        customer.setServiceType(dto.getServiceType());
        customer.setBlood(dto.getBlood());
        customer.setRegistrationCode(dto.getRegistrationCode());
        customer.setReferBy(dto.getReferBy());
        customer.setAadharNumber(dto.getAadharNumber());
        customer.setPrescription(dto.getPrescription());
    }

    private void checkDuplicateMobile(String mobile, String excludeMobile) {
        customerRepository.findByMobile(mobile)
                .filter(c -> excludeMobile == null || !c.getMobile().equals(excludeMobile))
                .ifPresent(c -> { throw new RuntimeException("Mobile number already exists"); });
    }

    private void checkDuplicateEmail(String email, String excludeMobile) {
        customerRepository.findByEmail(email)
                .filter(c -> excludeMobile == null || !c.getMobile().equals(excludeMobile))
                .ifPresent(c -> { throw new RuntimeException("Email already exists"); });
    }

    private void checkDuplicateAadhar(String aadhar, String excludeMobile) {
        customerRepository.findByAadharNumber(aadhar)
                .filter(c -> excludeMobile == null || !c.getMobile().equals(excludeMobile))
                .ifPresent(c -> { throw new RuntimeException("Aadhar number already exists"); });
    }
}
