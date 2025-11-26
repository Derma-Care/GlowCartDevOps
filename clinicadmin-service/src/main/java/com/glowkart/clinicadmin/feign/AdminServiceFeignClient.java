package com.glowkart.clinicadmin.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ClinicLoginRequest;
import com.glowkart.clinicadmin.dto.ClinicLoginResponse;


@FeignClient(name = "admin-service")
public interface AdminServiceFeignClient {

    @PostMapping("/admin/clinics/login")
    ApiResponse<ClinicLoginResponse> login(@RequestBody ClinicLoginRequest request);
}
