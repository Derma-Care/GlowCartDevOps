package com.glowkart.clinicadmin.feign;

import com.glowkart.clinicadmin.dto.ClinicLoginRequest;
import com.glowkart.clinicadmin.dto.ClinicLoginResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "admin-service")  // Eureka will resolve the URL automatically
public interface AdminServiceFeignClient {

    @PostMapping("/admin/clinics/login")
    ClinicLoginResponse login(@RequestBody ClinicLoginRequest request);
}
