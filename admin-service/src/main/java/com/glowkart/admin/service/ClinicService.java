package com.glowkart.admin.service;

import java.util.List;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ChangePasswordDTO;
import com.glowkart.admin.dto.ChangePayoutPasswordDTO;
import com.glowkart.admin.dto.ClinicRegistrationDTO;
import com.glowkart.admin.dto.ForgotPasswordRequest;
import com.glowkart.admin.dto.ResetPasswordRequest;
import com.glowkart.admin.model.Clinic;

public interface ClinicService {
    Clinic registerClinic(ClinicRegistrationDTO dto);

    Clinic startVerificationProcess(String clinicId);

    Clinic verifyClinic(String clinicId);

    Clinic rejectClinic(String clinicId, String reason);

    // NEW
    List<Clinic> getAll();

    Clinic getById(String clinicId);

    Clinic updateClinic(String clinicId, ClinicRegistrationDTO dto);

    void deleteClinic(String clinicId);

    Clinic login(String username, String password);

    // NEW: Get Verified Clinics
    List<Clinic> getVerifiedClinics();

    void changePassword(ChangePasswordDTO dto);

    ApiResponse<Void> forgotPassword(ForgotPasswordRequest request);  // UPDATED
    ApiResponse<Void> resetPassword(ResetPasswordRequest request);    // UPDATED
    ApiResponse<Void> resendOtp(ForgotPasswordRequest request);       // UPDATED

    // ==========================================================================================
    // PAYOUT LOGIN & PASSWORD MANAGEMENT
    // ==========================================================================================
    Clinic payoutLogin(String payoutUsername, String payoutPassword);

    void changePayoutPassword(ChangePayoutPasswordDTO dto);

    ApiResponse<Void> forgotPayoutPassword(ForgotPasswordRequest request);

    ApiResponse<Void> resetPayoutPassword(ResetPasswordRequest request);

    ApiResponse<Void> resendPayoutOtp(ForgotPasswordRequest request);
}
