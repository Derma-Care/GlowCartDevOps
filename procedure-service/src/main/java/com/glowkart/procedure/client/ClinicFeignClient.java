package com.glowkart.procedure.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.glowkart.procedure.dto.ClinicResponse;

@FeignClient(name = "admin-service")
public interface ClinicFeignClient {

    @GetMapping("/admin/clinics/{clinicId}")
    ClinicResponse getClinicById(@PathVariable("clinicId") String clinicId);
}
