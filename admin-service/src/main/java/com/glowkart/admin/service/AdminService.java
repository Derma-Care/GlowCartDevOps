package com.glowkart.admin.service;

import com.glowkart.admin.dto.*;
import com.glowkart.admin.model.Admin;
import com.glowkart.admin.repo.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Register admin
    public ApiResponse<AdminResponseDTO> registerAdmin(AdminRegisterDTO request) {

        if (adminRepository.findByMobileNumber(request.getMobileNumber()).isPresent()) {
            return new ApiResponse<>(false, "Admin with this mobile number already exists", null);
        }

        Admin admin = new Admin();
        admin.setUserName(request.getUserName());
        admin.setMobileNumber(request.getMobileNumber());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));

        admin = adminRepository.save(admin);

        AdminResponseDTO responseDTO = new AdminResponseDTO(admin.getId(), admin.getUserName(), admin.getMobileNumber());
        return new ApiResponse<>(true, "Admin registered successfully", responseDTO);
    }

    // Login admin
    public ApiResponse<AdminResponseDTO> loginAdmin(AdminLoginDTO request) {

        Optional<Admin> adminOpt = adminRepository.findByMobileNumber(request.getMobileNumber());

        // Generic login failure
        if (adminOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), adminOpt.get().getPassword())) {
            return new ApiResponse<>(false, "Invalid username or password", null);
        }

        Admin admin = adminOpt.get();
        AdminResponseDTO responseDTO = new AdminResponseDTO(admin.getId(), admin.getUserName(), admin.getMobileNumber());
        return new ApiResponse<>(true, "Login successful", responseDTO);
    }
}