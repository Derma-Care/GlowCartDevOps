package com.glowkart.procedure.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private final ZoneId istZone = ZoneId.of("Asia/Kolkata");

    // ================= CREATE PACKAGE =================
    @Override
    @Transactional
    public ProcedurePackageDTO create(ProcedurePackageDTO dto) {
        normalizePackageDTO(dto);

        ClinicResponse clinic = fetchClinic(dto.getClinicId());
        checkDuplicatePackageName(dto.getClinicId(), dto.getPackageName());
        validateProcedures(dto);
        validateDiscountAndOffer(dto);

        dto.setSittings(dto.getProcedures().stream().mapToInt(ProcedureItemDTO::getNoOfSittings).sum());
        processOfferAndPricing(dto);

        dto.setName(clinic.getName());
        dto.setAddress(clinic.getAddress());

        ProcedurePackage entity = mapper.toEntity(dto);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        return mapper.toDto(repo.save(entity));
    }

    // ================= UPDATE PACKAGE =================
    @Override
    @Transactional
    public ProcedurePackageDTO updateWithClinic(String packageId, String clinicId, ProcedurePackageDTO dto) {
        normalizePackageDTO(dto);

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
        dto.setSittings(dto.getProcedures().stream().mapToInt(ProcedureItemDTO::getNoOfSittings).sum());
        processOfferAndPricing(dto);

        dto.setName(clinic.getName());
        dto.setAddress(clinic.getAddress());

        ProcedurePackage updated = mapper.toEntity(dto);
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now());

        return mapper.toDto(repo.save(updated));
    }

    // ================= DELETE PACKAGE =================
    @Override
    @Transactional
    public void deleteWithClinic(String packageId, String clinicId) {
        ProcedurePackage existing = repo.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("RESOURCE_NOT_FOUND", "Package not found: " + packageId));

        if (!existing.getClinicId().equals(clinicId)) {
            throw new BadRequestException("PACKAGE_CLINIC_MISMATCH", "Package does not belong to the specified clinic");
        }

        repo.delete(existing);
    }

    // ================= READ OPERATIONS =================
    @Override
    @Transactional
    public List<ProcedurePackageDTO> getAll() {
        return repo.findAll().stream()
                .map(pkg -> {
                    ProcedurePackageDTO dto = mapper.toDto(pkg);
                    processOfferAndPricing(dto);
                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProcedurePackageDTO getById(String packageId) {
        ProcedurePackage pkg = repo.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("RESOURCE_NOT_FOUND", "Package not found: " + packageId));

        ProcedurePackageDTO dto = mapper.toDto(pkg);
        processOfferAndPricing(dto);
        return dto;
    }

    @Override
    @Transactional
    public List<ProcedurePackageDTO> getByClinic(String clinicId) {
        return repo.findByClinicId(clinicId).stream()
                .map(pkg -> {
                    ProcedurePackageDTO dto = mapper.toDto(pkg);
                    processOfferAndPricing(dto);
                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProcedurePackageDTO getByClinicAndPackage(String clinicId, String packageId) {
        ProcedurePackage pkg = repo.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("RESOURCE_NOT_FOUND", "Package not found: " + packageId));

        if (!pkg.getClinicId().equals(clinicId)) {
            throw new BadRequestException("PACKAGE_CLINIC_MISMATCH", "Package does not belong to the specified clinic");
        }

        ProcedurePackageDTO dto = mapper.toDto(pkg);
        processOfferAndPricing(dto);
        return dto;
    }

    // ================= SCHEDULED TASK =================
    @Scheduled(cron = "0 1 0 * * *", zone = "Asia/Kolkata")
    @Transactional
    public void expirePackageOffers() {
        LocalDate today = LocalDate.now(istZone);

        List<ProcedurePackage> packages = repo.findAll();
        for (ProcedurePackage pkg : packages) {
            if (pkg.getOfferValidDate() == null || pkg.getOfferValidDate().isBlank()) {
                processOfferAndPricing(mapper.toDto(pkg));
                continue;
            }
            try {
                LocalDate validDate = LocalDate.parse(pkg.getOfferValidDate());
                if (today.isAfter(validDate)) {
                    pkg.setOfferActive(false);
                    resetDiscountIfExpired(pkg);
                    recalculatePricing(pkg);
                    pkg.setUpdatedAt(Instant.now());
                    repo.save(pkg);
                }
            } catch (DateTimeParseException e) {
                // skip invalid date
            }
        }
    }

    // ================= HELPER METHODS =================
    private void normalizePackageDTO(ProcedurePackageDTO dto) {
        if (dto.getPackageName() != null) dto.setPackageName(dto.getPackageName().trim());
        if (dto.getName() != null) dto.setName(dto.getName().trim());
        if (dto.getAddress() != null) dto.setAddress(dto.getAddress().trim());
        if (dto.getProcedures() != null) {
            dto.getProcedures().forEach(p -> {
                if (p.getProcedureName() != null) p.setProcedureName(p.getProcedureName().trim());
            });
        }
        if (dto.getOfferStart() != null) dto.setOfferStart(dto.getOfferStart().trim());
        if (dto.getOfferValidDate() != null) dto.setOfferValidDate(dto.getOfferValidDate().trim());
    }

    private ClinicResponse fetchClinic(String clinicId) {
        ApiResponse<ClinicResponse> apiResponse = clinicClient.getClinicById(clinicId);
        if (apiResponse == null || !apiResponse.isSuccess() || apiResponse.getData() == null) {
            throw new BadRequestException("INVALID_CLINIC", "Invalid clinicId: " + clinicId);
        }
        return apiResponse.getData();
    }

    private void checkDuplicatePackageName(String clinicId, String packageName) {
        boolean exists = repo.findByClinicId(clinicId).stream()
                .anyMatch(p -> p.getPackageName().equalsIgnoreCase(packageName));
        if (exists) throw new BadRequestException("DUPLICATE_PACKAGE_NAME", "Package name already exists for clinic");
    }

    private void validateProcedures(ProcedurePackageDTO dto) {
        for (ProcedureItemDTO item : dto.getProcedures()) {
            procedurePricingRepository.findByClinicId(dto.getClinicId()).stream()
                .filter(p -> p.getProcedureName().equalsIgnoreCase(item.getProcedureName()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("INVALID_PROCEDURE", "Procedure not found: " + item.getProcedureName()));
        }
    }

    private void validateDiscountAndOffer(ProcedurePackageDTO dto) {
        Double discount = dto.getDiscountPercentage();
        boolean hasDiscount = discount != null && discount > 0;
        boolean hasOfferStart = dto.getOfferStart() != null && !dto.getOfferStart().isBlank();

        if (hasOfferStart && !hasDiscount)
            throw new BadRequestException("DISCOUNT_REQUIRED", "discountPercentage required when offerStart is provided");
        if (hasDiscount && !hasOfferStart)
            throw new BadRequestException("OFFER_START_REQUIRED", "offerStart required when discountPercentage > 0");

        LocalDate today = LocalDate.now(istZone);

        try {
            LocalDate startDate = hasOfferStart ? LocalDate.parse(dto.getOfferStart()) : null;
            LocalDate validDate = dto.getOfferValidDate() != null && !dto.getOfferValidDate().isBlank()
                    ? LocalDate.parse(dto.getOfferValidDate()) : null;

            if (startDate != null && startDate.isBefore(today))
                throw new BadRequestException("OFFER_START_PAST", "offerStart cannot be in the past");

            if (validDate != null && validDate.isBefore(today))
                throw new BadRequestException("OFFER_VALID_PAST", "offerValidDate cannot be in the past");

            if (startDate != null && validDate != null && validDate.isBefore(startDate))
                throw new BadRequestException("OFFER_VALID_BEFORE_START", "offerValidDate cannot be before offerStart");

        } catch (DateTimeParseException e) {
            throw new BadRequestException("INVALID_DATE", "Invalid date format. Expected yyyy-MM-dd");
        }
    }

    private void processOfferAndPricing(ProcedurePackageDTO dto) {
        setOfferStatus(dto);
        if (!dto.isOfferActive()) resetDiscountIfExpired(dto);
        calculatePricing(dto);
    }

    private void setOfferStatus(ProcedurePackageDTO dto) {
        LocalDate today = LocalDate.now(istZone);
        if (dto.getOfferStart() == null || dto.getOfferStart().isBlank()) {
            dto.setOfferActive(false);
            return;
        }
        try {
            LocalDate start = LocalDate.parse(dto.getOfferStart());
            LocalDate end = dto.getOfferValidDate() != null && !dto.getOfferValidDate().isBlank()
                    ? LocalDate.parse(dto.getOfferValidDate()) : null;

            dto.setOfferActive(!today.isBefore(start) && (end == null || !today.isAfter(end)));
        } catch (DateTimeParseException e) {
            dto.setOfferActive(false);
        }
    }

    private void resetDiscountIfExpired(ProcedurePackageDTO dto) {
        dto.setDiscountPercentage(0.0);
        dto.setDiscountAmount(0.0);
        dto.setTotalDiscountPercentage(dto.getNgkDiscountPercentage());
        dto.setTotalDiscountAmount(0.0);
    }

    private void resetDiscountIfExpired(ProcedurePackage pkg) {
        pkg.setDiscountPercentage(0.0);
        pkg.setDiscountAmount(0.0);
        pkg.setTotalDiscountPercentage(pkg.getNgkDiscountPercentage());
        pkg.setTotalDiscountAmount(0.0);
    }

    private void calculatePricing(ProcedurePackageDTO dto) {
        double price = dto.getPrice();
        double clinicDiscountPercent = dto.isOfferActive() ? dto.getDiscountPercentage() : 0.0;
        double clinicDiscountAmount = round(price * clinicDiscountPercent / 100.0);
        double discountedPrice = round(price - clinicDiscountAmount);

        double taxAmount = round(discountedPrice * dto.getTaxPercentage() / 100.0);
        double gstAmount = round(discountedPrice * dto.getGst() / 100.0);
        double consultationFee = dto.getConsultationFee() != null ? dto.getConsultationFee() : 0.0;
        double clinicPay = round(discountedPrice + taxAmount + gstAmount + consultationFee);

        double ngkDiscountPercent = dto.getNgkDiscountPercentage();
        double ngkDiscountAmount = round(clinicPay * ngkDiscountPercent / 100.0);
        double finalCost = round(clinicPay - ngkDiscountAmount);

        double totalDiscountAmount = round(clinicDiscountAmount + ngkDiscountAmount);
        double totalDiscountPercent = clinicDiscountPercent + ngkDiscountPercent;

        dto.setDiscountAmount(clinicDiscountAmount);
        dto.setNgkDiscountAmount(ngkDiscountAmount);
        dto.setTotalDiscountAmount(totalDiscountAmount);
        dto.setDiscountedCost(discountedPrice);
        dto.setTotalDiscountPercentage(totalDiscountPercent);
        dto.setTaxAmount(taxAmount);
        dto.setGstAmount(gstAmount);
        dto.setClinicPay(clinicPay);
        dto.setFinalCost(finalCost);
    }

    private void recalculatePricing(ProcedurePackage pkg) {
        double price = pkg.getPrice();
        double clinicDiscountPercent = 0.0; // offer expired
        double clinicDiscountAmount = round(price * clinicDiscountPercent / 100.0);
        double discountedPrice = round(price - clinicDiscountAmount);

        double taxAmount = round(discountedPrice * pkg.getTaxPercentage() / 100.0);
        double gstAmount = round(discountedPrice * pkg.getGst() / 100.0);
        double consultationFee = pkg.getConsultationFee() != null ? pkg.getConsultationFee() : 0.0;
        double clinicPay = round(discountedPrice + taxAmount + gstAmount + consultationFee);

        double ngkDiscountPercent = pkg.getNgkDiscountPercentage();
        double ngkDiscountAmount = round(clinicPay * ngkDiscountPercent / 100.0);
        double finalCost = round(clinicPay - ngkDiscountAmount);

        double totalDiscountAmount = round(clinicDiscountAmount + ngkDiscountAmount);
        double totalDiscountPercent = clinicDiscountPercent + ngkDiscountPercent;

        pkg.setDiscountAmount(clinicDiscountAmount);
        pkg.setNgkDiscountAmount(ngkDiscountAmount);
        pkg.setTotalDiscountAmount(totalDiscountAmount);
        pkg.setDiscountedCost(discountedPrice);
        pkg.setTotalDiscountPercentage(totalDiscountPercent);
        pkg.setTaxAmount(taxAmount);
        pkg.setGstAmount(gstAmount);
        pkg.setClinicPay(clinicPay);
        pkg.setFinalCost(finalCost);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    @Override
    public List<String> getClinicIdsByPackage(String packageId) {
        return repo.findById(packageId)
                .map(pkg -> List.of(pkg.getClinicId()))
                .orElseThrow(() -> new ResourceNotFoundException("PACKAGE_NOT_FOUND", "Package not found"));
    }



}
