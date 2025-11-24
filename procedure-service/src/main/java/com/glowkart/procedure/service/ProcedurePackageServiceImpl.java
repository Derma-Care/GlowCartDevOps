package com.glowkart.procedure.service;

import com.glowkart.procedure.client.ClinicFeignClient;
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
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

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

        // FETCH & VALIDATE CLINIC
        ClinicResponse clinic = fetchClinic(dto.getClinicId());

        // CHECK DUPLICATE PACKAGE
        checkDuplicatePackageName(dto.getClinicId(), dto.getPackageName());

        // VALIDATE PROCEDURES
        validateProcedures(dto);

        // TOTAL SITTINGS
        dto.setSittings(dto.getProcedures().stream()
                .mapToInt(ProcedureItemDTO::getNoOfSittings)
                .sum());

        // PRICE CALCULATION
        calculatePricing(dto);

        // AUTO-FILL CLINIC DETAILS
        dto.setClinicName(clinic.getName());
        dto.setClinicAddress(clinic.getAddress());

        ProcedurePackage entity = mapper.toEntity(dto);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        return mapper.toDto(repo.save(entity));
    }

    // ============================================================
    // UPDATE PACKAGE
    // ============================================================

    @Override
    public ProcedurePackageDTO update(String packageId, ProcedurePackageDTO dto) {

        ProcedurePackage existing = repo.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "RESOURCE_NOT_FOUND",
                        "Package not found: " + packageId
                ));

        // FETCH & VALIDATE CLINIC
        ClinicResponse clinic = fetchClinic(dto.getClinicId());

        if (!existing.getPackageName().equalsIgnoreCase(dto.getPackageName())) {
            checkDuplicatePackageName(dto.getClinicId(), dto.getPackageName());
        }

        validateProcedures(dto);

        dto.setPackageId(existing.getId());
        dto.setSittings(dto.getProcedures().stream()
                .mapToInt(ProcedureItemDTO::getNoOfSittings)
                .sum());

        calculatePricing(dto);

        // AUTO-FILL CLINIC NAME + ADDRESS
        dto.setClinicName(clinic.getName());
        dto.setClinicAddress(clinic.getAddress());

        ProcedurePackage updated = mapper.toEntity(dto);
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now());

        return mapper.toDto(repo.save(updated));
    }

    // ============================================================
    // READ OPERATIONS
    // ============================================================

    @Override
    public List<ProcedurePackageDTO> getAll() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProcedurePackageDTO getById(String packageId) {
        return mapper.toDto(
                repo.findById(packageId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "RESOURCE_NOT_FOUND",
                                "Package not found: " + packageId
                        ))
        );
    }

    @Override
    public List<ProcedurePackageDTO> getByClinic(String clinicId) {
        return repo.findByClinicId(clinicId).stream()
                .map(mapper::toDto)
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

        return mapper.toDto(pkg);
    }

    @Override
    public void delete(String packageId) {
        if (!repo.existsById(packageId)) {
            throw new ResourceNotFoundException(
                    "RESOURCE_NOT_FOUND",
                    "Package not found: " + packageId
            );
        }
        repo.deleteById(packageId);
    }

    // ============================================================
    // HELPER METHODS
    // ============================================================

    /**
     * Fetch clinic details from Admin Service (Feign call)
     */
    private ClinicResponse fetchClinic(String clinicId) {
        ClinicResponse response = clinicClient.getClinicById(clinicId);
        if (response == null) {
            throw new BadRequestException(
                    "INVALID_CLINIC",
                    "Invalid clinicId: " + clinicId
            );
        }
        return response;
    }

    private void checkDuplicatePackageName(String clinicId, String packageName) {
        boolean exists = repo.findByClinicId(clinicId).stream()
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
                        "Invalid procedure: " + item.getProcedureName() +
                                " for this clinic"
                );
            }
        }
    }

    private String getProcedureIdByName(String procedureName, String clinicId) {

        return procedurePricingRepository.findByClinicId(clinicId).stream()
                .filter(p -> p.getProcedureName().equalsIgnoreCase(procedureName))
                .map(p -> p.getProcedureId())
                .findFirst()
                .orElseThrow(() -> new BadRequestException(
                        "PROCEDURE_NOT_FOUND",
                        "Procedure not found: " + procedureName + " for clinic " + clinicId
                ));
    }

    private void calculatePricing(ProcedurePackageDTO dto) {
        double discountAmount = dto.getPrice() * dto.getDiscountPercentage() / 100.0;
        double discountedPrice = dto.getPrice() - discountAmount;
        double taxAmount = discountedPrice * dto.getTaxPercentage() / 100.0;
        double gstAmount = discountedPrice * dto.getGst() / 100.0;
        double platformFee = discountedPrice * dto.getPlatformFeePercentage() / 100.0;
        double consultationFee = dto.getConsultationFee() != null ? dto.getConsultationFee() : 0.0;

        dto.setDiscountAmount(discountAmount);
        dto.setDiscountedCost(discountedPrice);
        dto.setTaxAmount(taxAmount);
        dto.setGstAmount(gstAmount);
        dto.setPlatformFee(platformFee);
        dto.setClinicPay(discountedPrice + taxAmount + gstAmount - platformFee);
        dto.setFinalCost(discountedPrice + taxAmount + gstAmount + platformFee + consultationFee);
    }
}
