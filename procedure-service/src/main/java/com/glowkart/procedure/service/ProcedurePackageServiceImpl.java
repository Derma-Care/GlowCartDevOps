package com.glowkart.procedure.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
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
    
    @Value("${glowkart.platform.fee-percentage}")
    private double platformFeePercentage;


    // ================= CREATE =================
    @Override
    @Transactional
    public ProcedurePackageDTO create(ProcedurePackageDTO dto) {

        normalizePackageDTO(dto);

        ClinicResponse clinic = fetchClinic(dto.getClinicId());
        checkDuplicatePackageName(dto.getClinicId(), dto.getPackageName());
        validateProcedures(dto);
        validateDiscountAndOffer(dto);

        dto.setSittings(dto.getProcedures().stream()
                .mapToInt(ProcedureItemDTO::getNoOfSittings).sum());

        dto.setName(clinic.getName());
        dto.setAddress(clinic.getAddress());

        processOfferAndPricing(dto);

        ProcedurePackage entity = mapper.toEntity(dto);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());

        ProcedurePackage saved = repo.save(entity);
        ProcedurePackageDTO response = mapper.toDto(saved);

        // Ensure pricing fields are correct after mapping
        processOfferAndPricing(response);

        return response;
    }

    // ================= UPDATE =================
    @Override
    @Transactional
    public ProcedurePackageDTO updateWithClinic(String packageId, String clinicId, ProcedurePackageDTO dto) {

        normalizePackageDTO(dto);

        ProcedurePackage existing = repo.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("RESOURCE_NOT_FOUND", "Package not found"));

        if (!existing.getClinicId().equals(clinicId)) {
            throw new BadRequestException("PACKAGE_CLINIC_MISMATCH", "Package does not belong to clinic");
        }

        if (!existing.getPackageName().equalsIgnoreCase(dto.getPackageName())) {
            checkDuplicatePackageName(dto.getClinicId(), dto.getPackageName());
        }

        ClinicResponse clinic = fetchClinic(dto.getClinicId());
        validateProcedures(dto);
        validateDiscountAndOffer(dto);

        dto.setPackageId(existing.getId());
        dto.setSittings(dto.getProcedures().stream()
                .mapToInt(ProcedureItemDTO::getNoOfSittings).sum());
        dto.setName(clinic.getName());
        dto.setAddress(clinic.getAddress());

        processOfferAndPricing(dto);

        ProcedurePackage updated = mapper.toEntity(dto);
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now());

        ProcedurePackage saved = repo.save(updated);
        ProcedurePackageDTO response = mapper.toDto(saved);

        processOfferAndPricing(response);

        return response;
    }

    // ================= DELETE =================
    @Override
    @Transactional
    public void deleteWithClinic(String packageId, String clinicId) {

        ProcedurePackage existing = repo.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("RESOURCE_NOT_FOUND", "Package not found"));

        if (!existing.getClinicId().equals(clinicId)) {
            throw new BadRequestException("PACKAGE_CLINIC_MISMATCH", "Package does not belong to clinic");
        }

        repo.delete(existing);
    }

    // ================= READ =================
    @Override
    public List<ProcedurePackageDTO> getAll() {
        return repo.findAll().stream()
                .map(pkg -> {
                    ProcedurePackageDTO dto = mapper.toDto(pkg);
                    processOfferAndPricing(dto);
                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    public ProcedurePackageDTO getById(String packageId) {
        ProcedurePackage pkg = repo.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("RESOURCE_NOT_FOUND", "Package not found"));
        ProcedurePackageDTO dto = mapper.toDto(pkg);
        processOfferAndPricing(dto);
        return dto;
    }

    @Override
    public List<ProcedurePackageDTO> getByClinic(String clinicId) {
        return repo.findByClinicId(clinicId).stream()
                .map(pkg -> {
                    ProcedurePackageDTO dto = mapper.toDto(pkg);
                    processOfferAndPricing(dto);
                    return dto;
                }).collect(Collectors.toList());
    }

    // ================= SCHEDULER =================
    @Scheduled(cron = "0 1 0 * * *", zone = "Asia/Kolkata")
    @Transactional
    public void expirePackageOffers() {

        LocalDate today = LocalDate.now(istZone);

        for (ProcedurePackage pkg : repo.findAll()) {

            if (pkg.getOfferValidDate() == null || pkg.getOfferValidDate().isBlank()) {
                recalculatePricing(pkg);
                pkg.setUpdatedAt(Instant.now());
                repo.save(pkg);
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
            } catch (DateTimeParseException ignored) {}
        }
    }

    // ================= PRICING =================
//    private void processOfferAndPricing(ProcedurePackageDTO dto) {
//        setOfferStatus(dto);
//        if (!dto.isOfferActive()) resetDiscountIfExpired(dto);
//        calculatePricing(dto);
//
//        // Safeguard to always set totalDiscountedAmount
//        if (dto.getTotalDiscountedAmount() <= 0) {
//            double totalDiscountAmount = dto.getDiscountAmount() + dto.getNgkDiscountAmount();
//            dto.setTotalDiscountedAmount(round(dto.getPrice() - totalDiscountAmount));
//        }
//    }
    private void processOfferAndPricing(ProcedurePackageDTO dto) {

        setOfferStatus(dto);

        calculatePricing(dto);

        applyPlatformFee(dto);        // 👈 move before payment

        calculatePaymentAmounts(dto); // 👈 now uses updated finalCost
    }

    private void applyPlatformFee(ProcedurePackageDTO dto) {

        double platformFee = round(dto.getPrice() * platformFeePercentage / 100.0);

        dto.setPlatformFee(platformFee);
        dto.setPlatformFeePercentage(platformFeePercentage);

        // ✅ ADD platform fee to final cost
        dto.setFinalCost(round(dto.getFinalCost() + platformFee));
    }



    private void calculatePricing(ProcedurePackageDTO dto) {

        double price = dto.getPrice();

        double clinicDiscountPercent = dto.getDiscountPercentage();
        double ngkDiscountPercent = dto.getNgkDiscountPercentage();

        // Apply clinic discount ONLY if offer is active
        double clinicDiscountAmount = dto.isOfferActive()
                ? round(price * clinicDiscountPercent / 100.0)
                : 0.0;

        double discountedCost = dto.isOfferActive()
                ? round(price - clinicDiscountAmount)
                : price;

        double taxAmount = round(discountedCost * dto.getTaxPercentage() / 100.0);
        double gstAmount = round(discountedCost * dto.getGst() / 100.0);

        double consultationFee = dto.getConsultationFee() != null
                ? dto.getConsultationFee()
                : 0.0;

        double clinicPay = round(discountedCost + taxAmount + gstAmount + consultationFee);

        // NGK discount ONLY if offer is active
        double ngkDiscountAmount = (dto.isOfferActive() && ngkDiscountPercent > 0)
                ? round(clinicPay * ngkDiscountPercent / 100.0)
                : 0.0;

        double finalCost = round(clinicPay - ngkDiscountAmount);

        // Totals (percentages ALWAYS visible)
        double totalDiscountAmount = round(clinicDiscountAmount + ngkDiscountAmount);
        double totalDiscountPercentage = clinicDiscountPercent + ngkDiscountPercent;

        // SET VALUES
        dto.setDiscountAmount(clinicDiscountAmount);
        dto.setNgkDiscountAmount(ngkDiscountAmount);
        dto.setTotalDiscountAmount(totalDiscountAmount);
        dto.setTotalDiscountPercentage(totalDiscountPercentage);

        dto.setDiscountedCost(discountedCost);
        dto.setTaxAmount(taxAmount);
        dto.setGstAmount(gstAmount);
        dto.setClinicPay(clinicPay);
        dto.setFinalCost(finalCost);

        dto.setTotalDiscountedAmount(round(price - totalDiscountAmount));
    }




    private void recalculatePricing(ProcedurePackage pkg) {

        double price = pkg.getPrice();
        double ngkDiscountAmount = round(price * pkg.getNgkDiscountPercentage() / 100);

        double totalDiscountedAmount = round(price - ngkDiscountAmount);

        double taxAmount = round(price * pkg.getTaxPercentage() / 100);
        double gstAmount = round(price * pkg.getGst() / 100);

        double consultationFee = pkg.getConsultationFee() != null ? pkg.getConsultationFee() : 0;
        double clinicPay = round(price + taxAmount + gstAmount + consultationFee);

        pkg.setTotalDiscountedAmount(totalDiscountedAmount);
        pkg.setTaxAmount(taxAmount);
        pkg.setGstAmount(gstAmount);
        pkg.setClinicPay(clinicPay);
        pkg.setFinalCost(round(clinicPay - ngkDiscountAmount));
    }
    private void calculatePaymentAmounts(ProcedurePackageDTO dto) {

        double finalCost = dto.getFinalCost();
        String paymentType = dto.getPaymentType();

        // Default = FULL PAYMENT
        if (paymentType == null || paymentType.isBlank()) {
            dto.setPartialAmount(round(finalCost));
            dto.setDueAmount(0.0);
            return;
        }

        switch (paymentType.toUpperCase()) {

            case "FULL_PAYMENT":
                dto.setPartialAmount(round(finalCost));
                dto.setDueAmount(0.0);
                break;

            case "PARTIAL_PAYMENT":
                double percentage = dto.getPartialPaymentPercentage();

                if (percentage <= 0 || percentage > 100) {
                    throw new BadRequestException(
                            "INVALID_PARTIAL_PERCENTAGE",
                            "partialPaymentPercentage must be between 1 and 100"
                    );
                }

                double partialAmount = round(finalCost * percentage / 100.0);
                double dueAmount = round(finalCost - partialAmount);

                dto.setPartialAmount(partialAmount);
                dto.setDueAmount(dueAmount);
                break;

            default:
                throw new BadRequestException(
                        "INVALID_PAYMENT_TYPE",
                        "paymentType must be FULL_PAYMENT or PARTIAL_PAYMENT"
                );
        }
    }

    // ================= UTIL =================
    private void resetDiscountIfExpired(ProcedurePackageDTO dto) {

        dto.setDiscountAmount(0.0);
        dto.setNgkDiscountAmount(0.0);
        dto.setTotalDiscountAmount(0.0);

        dto.setTotalDiscountPercentage(
                dto.getDiscountPercentage() + dto.getNgkDiscountPercentage()
        );

        dto.setTotalDiscountedAmount(dto.getPrice());
    }


    private void resetDiscountIfExpired(ProcedurePackage pkg) {

        pkg.setDiscountAmount(0.0);
        pkg.setNgkDiscountAmount(0.0);
        pkg.setTotalDiscountAmount(0.0);

        pkg.setTotalDiscountPercentage(
                pkg.getDiscountPercentage() + pkg.getNgkDiscountPercentage()
        );

        pkg.setTotalDiscountedAmount(pkg.getPrice());
    }


    private void setOfferStatus(ProcedurePackageDTO dto) {

        LocalDate today = LocalDate.now(istZone);

        if (dto.getOfferStart() == null || dto.getOfferStart().isBlank()) {
            dto.setOfferActive(false);
            return;
        }

        try {
            LocalDate start = LocalDate.parse(dto.getOfferStart());

            LocalDate end = null;
            if (dto.getOfferValidDate() != null && !dto.getOfferValidDate().isBlank()) {
                end = LocalDate.parse(dto.getOfferValidDate());
            }

            boolean active =
                    !today.isBefore(start) &&
                    (end == null || !today.isAfter(end));

            dto.setOfferActive(active);

        } catch (DateTimeParseException e) {
            dto.setOfferActive(false);
        }
    }


    private void normalizePackageDTO(ProcedurePackageDTO dto) {
        if (dto.getPackageName() != null) dto.setPackageName(dto.getPackageName().trim());
    }

    private ClinicResponse fetchClinic(String clinicId) {
        ApiResponse<ClinicResponse> res = clinicClient.getClinicById(clinicId);
        if (res == null || !res.isSuccess() || res.getData() == null) {
            throw new BadRequestException("INVALID_CLINIC", "Invalid clinicId");
        }
        return res.getData();
    }

    private void checkDuplicatePackageName(String clinicId, String name) {
        boolean exists = repo.findByClinicId(clinicId)
                .stream().anyMatch(p -> p.getPackageName().equalsIgnoreCase(name));
        if (exists) throw new BadRequestException("DUPLICATE_PACKAGE_NAME", "Package already exists");
    }

    private void validateProcedures(ProcedurePackageDTO dto) {
        for (ProcedureItemDTO item : dto.getProcedures()) {
            procedurePricingRepository.findByClinicId(dto.getClinicId()).stream()
                    .filter(p -> p.getProcedureName().equalsIgnoreCase(item.getProcedureName()))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException(
                            "INVALID_PROCEDURE", "Procedure not found: " + item.getProcedureName()));
        }
    }

    private void validateDiscountAndOffer(ProcedurePackageDTO dto) {
        if (dto.getDiscountPercentage() > 0 &&
            (dto.getOfferStart() == null || dto.getOfferStart().isBlank())) {
            throw new BadRequestException("OFFER_START_REQUIRED", "offerStart required");
        }
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    @Override
    @Transactional
    public ProcedurePackageDTO getByClinicAndPackage(String clinicId, String packageId) {

        ProcedurePackage pkg = repo.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "RESOURCE_NOT_FOUND", "Package not found: " + packageId));

        if (!pkg.getClinicId().equals(clinicId)) {
            throw new BadRequestException(
                    "PACKAGE_CLINIC_MISMATCH",
                    "Package does not belong to the specified clinic");
        }

        ProcedurePackageDTO dto = mapper.toDto(pkg);
        processOfferAndPricing(dto);
        return dto;
    }

    @Override
    @Transactional
    public List<String> getClinicIdsByPackage(String packageId) {

        return repo.findById(packageId)
                .map(pkg -> List.of(pkg.getClinicId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "PACKAGE_NOT_FOUND", "Package not found: " + packageId));
    }
}
