package com.glowkart.admin.client;

import com.glowkart.admin.dto.ApiResponse;
import com.glowkart.admin.dto.ProcedureDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
        name = "procedure-service"
)
public interface ProcedureClient {

    @PostMapping("/procedures/create")
    ApiResponse<ProcedureDTO> createProcedure(@RequestBody ProcedureDTO dto);

    @PutMapping("/procedures/update/{procedureId}")
    ApiResponse<ProcedureDTO> updateProcedure(
            @PathVariable("procedureId") String procedureId,
            @RequestBody ProcedureDTO dto
    );

    @GetMapping("/procedures/get/{procedureId}")
    ApiResponse<ProcedureDTO> getProcedureById(@PathVariable("procedureId") String procedureId);

    @GetMapping("/procedures/all")
    ApiResponse<List<ProcedureDTO>> getAllProcedures();

    @DeleteMapping("/procedures/delete/{procedureId}")
    ApiResponse<Void> deleteProcedure(@PathVariable("procedureId") String procedureId);
}
