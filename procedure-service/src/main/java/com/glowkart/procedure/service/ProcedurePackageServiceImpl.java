package com.glowkart.procedure.service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.glowkart.procedure.client.ClinicFeignClient;
import com.glowkart.procedure.dto.ApiResponse;
import com.glowkart.procedure.dto.ClinicResponse;
import com.glowkart.procedure.dto.ProcedureItemDTO;
import com.glowkart.procedure.dto.ProcedurePackageDTO;
import com.glowkart.procedure.exception.BadRequestException;
import com.glowkart.procedure.exception.ResourceNotFoundException;
import com.glowkart.procedure.mapper.ProcedurePackageMapper;
import com.glowkart.procedure.model.ProcedurePackage;
import com.glowkart.procedure.repo.ProcedurePackageRepository;
import com.glowkart.procedure.repo.ProcedurePricingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProcedurePackageServiceImpl implements ProcedurePackageService {

    private final ProcedurePackageRepository repo;
    private final ProcedurePackageMapper mapper;
    private final ClinicFeignClient clinicClient;
    private final ProcedurePricingRepository procedurePricingRepository;

    // ============================================================
    // CREATE PACKAGE
    // ============================================================

    @Override
    public ProcedurePackageDTO create(ProcedurePackageDTO dto) {

        // Fetch clinic info
        ClinicResponse clinic = fetchClinic(dto.getClinicId());

        // Debug: print the entire clinic object to see its fields
        System.out.println("Fetched Clinic from Feign: " + clinic);

        // Check for duplicate package name
        checkDuplicatePackageName(dto.getClinicId(), dto.getPackageName());

        // Validate procedures
        validateProcedures(dto);

        // Validate discount & offer rules
        validateDiscountAndOffer(dto);

        // Calculate total sittings
        dto.setSittings(dto.getProcedures().stream()
                .mapToInt(ProcedureItemDTO::getNoOfSittings)
                .sum());

        // Set offer status and calculate pricing
        setOfferActive(dto);
        calculatePricing(dto);

        // Set name & address from clinic
        // Make sure you use the correct getter names based on ClinicResponse
        dto.setName(clinic.getName());      // or clinic.getClinicName()
        dto.setAddress(clinic.getAddress()); // or clinic.getClinicAddress()

        // Map to entity and save
        ProcedurePackage entity = mapper.toEntity(dto);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        ProcedurePackage saved = repo.save(entity);

        return mapper.toDto(saved);
    }


    // ============================================================
    // UPDATE PACKAGE
    // ============================================================

    @Override
    public ProcedurePackageDTO updateWithClinic(String packageId, String clinicId, ProcedurePackageDTO dto) {

        ProcedurePackage existing = repo.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("RESOURCE_NOT_FOUND", "Package not found: " + packageId));

        if (!existing.getClinicId().equals(clinicId)) {
            throw new BadRequestException("PACKAGE_CLINIC_MISMATCH", "Package does not belong to the specified clinic");
        }

        ClinicResponse clinic = fetchClinic(dto.getClinicId());

        if (!existing.getPackageName().equalsIgnoreCase(dto.getPackageName())) {
            checkDuplicatePackageName(dto.getClinicId(), dto.getPackageName());
        }

        validateProcedures(dto);
        validateDiscountAndOffer(dto);

        dto.setPackageId(existing.getId());
        dto.setSittings(dto.getProcedures().stream()
                .mapToInt(p -> p.getNoOfSittings())
                .sum());

        setOfferActive(dto);
        calculatePricing(dto);

        dto.setName(clinic.getName());
        dto.setAddress(clinic.getAddress());

        ProcedurePackage updated = mapper.toEntity(dto);
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now());

        return mapper.toDto(repo.save(updated));
    }

    @Override
    public void deleteWithClinic(String packageId, String clinicId) {
        ProcedurePackage existing = repo.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("RESOURCE_NOT_FOUND", "Package not found: " + packageId));

        if (!existing.getClinicId().equals(clinicId)) {
            throw new BadRequestException("PACKAGE_CLINIC_MISMATCH", "Package does not belong to the specified clinic");
        }

        repo.delete(existing);
    }

    // ============================================================
    // READ OPERATIONS
    // ============================================================

    @Override
    public List<ProcedurePackageDTO> getAll() {
        return repo.findAll()
                .stream()
                .map(entity -> {
                    ProcedurePackageDTO dto = mapper.toDto(entity);
                    setOfferActive(dto);
                    calculatePricing(dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public ProcedurePackageDTO getById(String packageId) {
        ProcedurePackage entity = repo.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "RESOURCE_NOT_FOUND", "Package not found: " + packageId
                ));

        ProcedurePackageDTO dto = mapper.toDto(entity);
        setOfferActive(dto);
        calculatePricing(dto);
        return dto;
    }

    @Override
    public List<ProcedurePackageDTO> getByClinic(String clinicId) {
        return repo.findByClinicId(clinicId)
                .stream()
                .map(entity -> {
                    ProcedurePackageDTO dto = mapper.toDto(entity);
                    setOfferActive(dto);
                    calculatePricing(dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public ProcedurePackageDTO getByClinicAndPackage(String clinicId, String packageId) {
        ProcedurePackage pkg = repo.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "RESOURCE_NOT_FOUND", "Package not found: " + packageId));

        if (!pkg.getClinicId().equals(clinicId)) {
            throw new BadRequestException(
                    "PACKAGE_CLINIC_MISMATCH",
                    "Package does not belong to the specified clinic"
            );
        }

        ProcedurePackageDTO dto = mapper.toDto(pkg);
        setOfferActive(dto);
        calculatePricing(dto);

        return dto;
    }

   

    // ============================================================
    // HELPER METHODS
    // ============================================================

    private ClinicResponse fetchClinic(String clinicId) {
        ApiResponse<ClinicResponse> apiResponse = clinicClient.getClinicById(clinicId);

        if (apiResponse == null || !apiResponse.isSuccess() || apiResponse.getData() == null) {
            throw new BadRequestException("INVALID_CLINIC", "Invalid clinicId: " + clinicId);
        }

        return apiResponse.getData();
    }


    private void checkDuplicatePackageName(String clinicId, String packageName) {
        boolean exists = repo.findByClinicId(clinicId)
                .stream()
                .anyMatch(p -> p.getPackageName().equalsIgnoreCase(packageName));

        if (exists) {
            throw new BadRequestException(
                    "DUPLICATE_PACKAGE_NAME",
                    "A package named '" + packageName + "' already exists for this clinic"
            );
        }
    }

    private void validateProcedures(ProcedurePackageDTO dto) {
        for (ProcedureItemDTO item : dto.getProcedures()) {
            boolean exists = procedurePricingRepository.existsByProcedureIdAndClinicId(
                    getProcedureIdByName(item.getProcedureName(), dto.getClinicId()),
                    dto.getClinicId()
            );

            if (!exists) {
                throw new BadRequestException(
                        "INVALID_PROCEDURE",
                        "Invalid procedure: " + item.getProcedureName()
                );
            }
        }
    }

    private String getProcedureIdByName(String procedureName, String clinicId) {
        return procedurePricingRepository.findByClinicId(clinicId)
                .stream()
                .filter(p -> p.getProcedureName().equalsIgnoreCase(procedureName))
                .map(p -> p.getProcedureId())
                .findFirst()
                .orElseThrow(() -> new BadRequestException(
                        "PROCEDURE_NOT_FOUND",
                        "Procedure not found: " + procedureName
                ));
    }

    // ============================================================
    // VALIDATE DISCOUNT & OFFER LOGIC
    // ============================================================

    private void validateDiscountAndOffer(ProcedurePackageDTO dto) {

        Double discount = dto.getDiscountPercentage();
        String offerStart = dto.getOfferStart();

        boolean hasDiscount = discount != null && discount > 0;
        boolean hasOfferStart = offerStart != null && !offerStart.isBlank();

        if (hasOfferStart && !hasDiscount) {
            throw new BadRequestException(
                    "DISCOUNT_REQUIRED",
                    "discountPercentage is required when offerStart is provided"
            );
        }

        if (hasDiscount && !hasOfferStart) {
            throw new BadRequestException(
                    "OFFER_START_REQUIRED",
                    "offerStart is required when discountPercentage > 0"
            );
        }
    }

    // ============================================================
    // OFFER LOGIC
    // ============================================================

    private void setOfferActive(ProcedurePackageDTO dto) {
        Instant now = Instant.now();

        try {
            if (dto.getOfferStart() == null || dto.getOfferStart().isBlank()) {
                dto.setOfferActive(false);
                return;
            }

            Instant start = Instant.parse(dto.getOfferStart());

            if (dto.getOfferValidDate() == null || dto.getOfferValidDate().isBlank()) {
                dto.setOfferActive(!now.isBefore(start));
                return;
            }

            Instant end = Instant.parse(dto.getOfferValidDate());
            boolean active = !now.isBefore(start) && !now.isAfter(end);

            dto.setOfferActive(active);

        } catch (Exception e) {
            dto.setOfferActive(false);
        }
    }

    // ============================================================
    // PRICING LOGIC
    // ============================================================

    private void calculatePricing(ProcedurePackageDTO dto) {

        double price = dto.getPrice(); // always has a value

        // Clinic discount
        double clinicDiscountPercent = dto.isOfferActive() ? dto.getDiscountPercentage() : 0.0;
        double clinicDiscountAmount = round(price * clinicDiscountPercent / 100.0);
        double discountedPrice = round(price - clinicDiscountAmount);

        // Taxes
        double taxAmount = round(discountedPrice * dto.getTaxPercentage() / 100.0);
        double gstAmount = round(discountedPrice * dto.getGst() / 100.0);

        // Clinic pay before NGK
        double consultationFee = dto.getConsultationFee() != null ? dto.getConsultationFee() : 0.0;
        double clinicPay = round(discountedPrice + taxAmount + gstAmount + consultationFee);

        // NGK discount applied on clinic pay
        double ngkDiscountPercent = dto.getNgkDiscountPercentage(); // primitive
        double ngkDiscountAmount = round(clinicPay * ngkDiscountPercent / 100.0);

        // Final cost after NGK discount
        double finalCost = round(clinicPay - ngkDiscountAmount);

        // Total discount for reporting (clinic + NGK)
        double totalDiscountAmount = round(clinicDiscountAmount + ngkDiscountAmount);
        double totalDiscountPercent = clinicDiscountPercent + ngkDiscountPercent;

        // Set values in DTO
        dto.setDiscountAmount(clinicDiscountAmount);       // clinic discount only
        dto.setNgkDiscountAmount(ngkDiscountAmount);
        dto.setTotalDiscountAmount(totalDiscountAmount);

        dto.setDiscountedCost(discountedPrice);
        dto.setTotalDiscountPercentage(totalDiscountPercent);

        dto.setTaxAmount(taxAmount);
        dto.setGstAmount(gstAmount);

        dto.setClinicPay(clinicPay);
        dto.setFinalCost(finalCost);
    }

    // Utility method to round to 2 decimals
    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }


}
