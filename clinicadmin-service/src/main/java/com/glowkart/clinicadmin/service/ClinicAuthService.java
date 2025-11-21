package com.glowkart.clinicadmin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glowkart.clinicadmin.dto.ClinicLoginRequest;
import com.glowkart.clinicadmin.dto.ClinicLoginResponse;
import com.glowkart.clinicadmin.feign.AdminServiceFeignClient;
import feign.FeignException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class ClinicAuthService {

    @Autowired
    private AdminServiceFeignClient client;

    @Autowired
    private ObjectMapper objectMapper;  // Jackson ObjectMapper to parse JSON

    public ClinicLoginResponse login(String username, String password) {
        ClinicLoginRequest request = new ClinicLoginRequest();
        request.setUsername(username);
        request.setPassword(password);

        try {
            return client.login(request);
        } catch (FeignException e) {
            Map<String, Object> errorBody;
            try {
                // Parse Feign error response to Map
                errorBody = objectMapper.readValue(e.contentUTF8(), Map.class);
            } catch (Exception ex) {
                // Fallback if parsing fails
                errorBody = Map.of("error", e.getMessage());
            }

            // Throw ResponseStatusException with proper JSON body
            throw new ResponseStatusException(
                    HttpStatus.valueOf(e.status()),
                    errorBody.get("error").toString()
            );
        }
    }
}
