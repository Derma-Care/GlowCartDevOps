package com.glowkart.customer.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.glowkart.customer.dto.ApiResponse;
import com.glowkart.customer.dto.CompleteRegistrationDTO;
import com.glowkart.customer.dto.CustomerDetailsDTO;
import com.glowkart.customer.dto.SpinWheelDTO;
import com.glowkart.customer.dto.WheelSliceDto;
import com.glowkart.customer.model.Customer;
import com.glowkart.customer.repo.CustomerRepository;
import com.glowkart.customer.feign.WheelSliceClient;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private WheelSliceClient wheelSliceClient;

    // ==================== STEP-1 ====================
    public ApiResponse<Customer> saveCustomer(CustomerDetailsDTO dto) {
        Customer customer = customerRepository.findAll().stream()
                .filter(c -> dto.getRegistrationCode().equals(c.getRegistrationCode()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid user session"));

        checkDuplicateMobile(dto.getMobile(), customer.getMobile());
        checkDuplicateEmail(dto.getEmail(), customer.getMobile());
        checkDuplicateAadhar(dto.getAadharNumber(), customer.getMobile());

        copyStep1Fields(dto, customer);
        customer.setUserProfileCompleted(true);
        customerRepository.save(customer);

        return new ApiResponse<>(true, "Step-1: User profile completed successfully", customer);
    }

    // ==================== STEP-2 ====================
    public ApiResponse<Customer> completeSpinByMobile(String mobile, SpinWheelDTO dto) {
        Customer customer = customerRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (!customer.isUserProfileCompleted()) {
            return new ApiResponse<>(false, "Complete Profile first!", null);
        }

        WheelSliceDto slice = wheelSliceClient.getSliceById(dto.getRewardId());
        if (slice != null) {
            customer.setSpinRewardId(slice.getId());
            customer.setSpinRewardValue(slice.getOption());
            customer.setSpinRewardImage(slice.getSrc());
        }

        customer.setSpinWheelCompleted(true);
        customerRepository.save(customer);

        return new ApiResponse<>(true, "Step-2: Spin wheel completed", customer);
    }

    // ==================== STEP-3 ====================
    public ApiResponse<Customer> completeRegistrationByMobile(String mobile, CompleteRegistrationDTO dto) {
        Customer customer = customerRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (!customer.isSpinWheelCompleted()) {
            return new ApiResponse<>(false, "Complete Spin Wheel first!", null);
        }

        customer.setPrizePostScreenshot(dto.getPrizePostScreenshot());
        customer.setFollowScreenshot(dto.getFollowScreenshot());
        customer.setAddress(dto.getAddress());

        customer.setRegistrationCompleted(true);
        customerRepository.save(customer);

        return new ApiResponse<>(true, "Step-3: Final registration completed", customer);
    }

    // ==================== GET Wheel Slices ====================
    public ApiResponse<List<WheelSliceDto>> getWheelSlices() {
        List<WheelSliceDto> slices = wheelSliceClient.getAllSlices();
        return new ApiResponse<>(true, "Wheel slices fetched successfully", slices);
    }

    // ==================== CRUD ====================
    public ApiResponse<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        if (customers.isEmpty()) {
            return new ApiResponse<>(false, "No customers found", null);
        }
        return new ApiResponse<>(true, "Customers retrieved successfully", customers);
    }

    public ApiResponse<Customer> getCustomer(String mobile) {
        Customer customer = customerRepository.findByMobile(mobile).orElse(null);
        if (customer == null) {
            return new ApiResponse<>(false, "Customer not found", null);
        }
        return new ApiResponse<>(true, "Customer found", customer);
    }

    public ApiResponse<String> deleteCustomer(String mobile) {
        Customer customer = customerRepository.findByMobile(mobile).orElse(null);
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
                .filter(c -> !c.getMobile().equals(excludeMobile))
                .ifPresent(c -> { throw new RuntimeException("Mobile number already exists"); });
    }

    private void checkDuplicateEmail(String email, String excludeMobile) {
        customerRepository.findByEmail(email)
                .filter(c -> !c.getMobile().equals(excludeMobile))
                .ifPresent(c -> { throw new RuntimeException("Email already exists"); });
    }

    private void checkDuplicateAadhar(String aadhar, String excludeMobile) {
        customerRepository.findByAadharNumber(aadhar)
                .filter(c -> !c.getMobile().equals(excludeMobile))
                .ifPresent(c -> { throw new RuntimeException("Aadhar number already exists"); });
    }
}
