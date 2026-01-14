package com.glowkart.clinicadmin.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.glowkart.clinicadmin.dto.ApiResponse;
import com.glowkart.clinicadmin.dto.ClinicEnquiryDTO;
import com.glowkart.clinicadmin.model.ClinicEnquiry;
import com.glowkart.clinicadmin.service.ClinicEnquiryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/clinic-admin")
@RequiredArgsConstructor
@Validated
public class ClinicEnquiryController {

	private final ClinicEnquiryService clinicEnquiryService;

	// --------------------------------------------------
	// CREATE ENQUIRY
	// --------------------------------------------------
	@PostMapping("/clinic-enquiries/create")
	public ResponseEntity<ApiResponse<ClinicEnquiry>> createEnquiry(@Valid @RequestBody ClinicEnquiryDTO dto) {
		try {
			ApiResponse<ClinicEnquiry> response = clinicEnquiryService.createEnquiry(dto);

			return ResponseEntity.status(response.getStatusCode()).body(response);

		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new ApiResponse<>(false, ex.getMessage(), null, HttpStatus.BAD_REQUEST.value()));
		}
	}

	// --------------------------------------------------
	// UPDATE ENQUIRY
	// --------------------------------------------------
	@PutMapping("/clinic-enquiries/{enquiryId}")
	public ResponseEntity<ApiResponse<ClinicEnquiry>> updateEnquiry(@PathVariable String enquiryId,
			@Valid @RequestBody ClinicEnquiryDTO dto) {
		try {
			ApiResponse<ClinicEnquiry> response = clinicEnquiryService.updateEnquiry(enquiryId, dto);

			return ResponseEntity.status(response.getStatusCode()).body(response);

		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new ApiResponse<>(false, ex.getMessage(), null, HttpStatus.BAD_REQUEST.value()));
		}
	}

	// --------------------------------------------------
	// GET ALL ENQUIRIES
	// --------------------------------------------------
	@GetMapping("/clinic-enquiries/getAll")
	public ResponseEntity<ApiResponse<List<ClinicEnquiry>>> getAllEnquiries() {
		try {
			ApiResponse<List<ClinicEnquiry>> response = clinicEnquiryService.getAllEnquiries();

			return ResponseEntity.ok(response);

		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new ApiResponse<>(false, ex.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR.value()));
		}
	}

	// --------------------------------------------------
	// GET BY CLINIC ID
	// --------------------------------------------------
	@GetMapping("/clinic-enquiries/clinic/{clinicId}")
	public ResponseEntity<ApiResponse<List<ClinicEnquiry>>> getByClinicId(@PathVariable String clinicId) {
		try {
			ApiResponse<List<ClinicEnquiry>> response = clinicEnquiryService.getEnquiriesByClinicId(clinicId);

			return ResponseEntity.ok(response);

		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new ApiResponse<>(false, ex.getMessage(), null, HttpStatus.BAD_REQUEST.value()));
		}
	}

	// --------------------------------------------------
	// GET BY ID
	// --------------------------------------------------
	@GetMapping("/clinic-enquiries/{id}")
	public ResponseEntity<ApiResponse<ClinicEnquiry>> getById(@PathVariable String id) {
		try {
			ApiResponse<ClinicEnquiry> response = clinicEnquiryService.getEnquiryById(id);

			return ResponseEntity.ok(response);

		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(new ApiResponse<>(false, ex.getMessage(), null, HttpStatus.NOT_FOUND.value()));
		}
	}

	// --------------------------------------------------
	// DELETE ENQUIRY
	// --------------------------------------------------
	@DeleteMapping("/clinic-enquiries/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteEnquiry(@PathVariable String id) {
		try {
			ApiResponse<Void> response = clinicEnquiryService.deleteEnquiry(id);

			return ResponseEntity.ok(response);

		} catch (RuntimeException ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(new ApiResponse<>(false, ex.getMessage(), null, HttpStatus.NOT_FOUND.value()));
		}
	}
}
