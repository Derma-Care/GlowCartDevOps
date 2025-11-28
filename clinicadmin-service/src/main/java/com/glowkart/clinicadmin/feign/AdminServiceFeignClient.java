package com.glowkart.clinicadmin.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ClinicInfoDTO;
import com.glowkart.clinicadmin.dto.ClinicLoginRequest;


@FeignClient(name = "admin-service")
public interface AdminServiceFeignClient {

    @PostMapping("/admin/clinics/login")
    ResponseEntity<ApiResponse<ClinicInfoDTO>> login(@RequestBody ClinicLoginRequest request);

}

