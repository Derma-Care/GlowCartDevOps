package com.glowkart.booking.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glowkart.booking.dto.ApiResponse;
import com.glowkart.booking.exception.WalletServiceException;
import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;

import java.io.InputStream;

@Slf4j
public class FeignErrorDecoder implements ErrorDecoder {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Exception decode(String methodKey, Response response) {
        try (InputStream is = response.body().asInputStream()) {

            ApiResponse<?> apiResponse =
                    objectMapper.readValue(is, ApiResponse.class);

            return new WalletServiceException(
                    apiResponse.getMessage(),
                    apiResponse.getStatusCode()
            );

        } catch (Exception e) {
            log.error("Failed to decode Feign error response", e);
            return new WalletServiceException(
                    "Customer service error",
                    response.status()
            );
        }
    }
}
