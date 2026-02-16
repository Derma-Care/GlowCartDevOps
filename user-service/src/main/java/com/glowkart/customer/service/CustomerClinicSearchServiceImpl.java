package com.glowkart.customer.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.glowkart.customer.dto.ClinicDetailsDTO;
import com.glowkart.customer.dto.ClinicProcedureLinkDTO;
import com.glowkart.customer.dto.ClinicPublicDTO;
import com.glowkart.customer.dto.ProcedurePackageDTO;
import com.glowkart.customer.dto.ProcedurePackageWithClinicsDTO;
import com.glowkart.customer.dto.ProcedurePricingDTO;
import com.glowkart.customer.feign.AdminClinicClient;
import com.glowkart.customer.feign.ProcedureServiceClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerClinicSearchServiceImpl implements CustomerClinicSearchService {

//    private final ReverseGeoService reverseGeoService;
    private final AdminClinicClient adminClinicClient;
    private final ProcedureServiceClient procedureServiceClient;

    // =========================================================
    // Find clinics offering a procedure
    // =========================================================
    @Override
    public List<ClinicProcedureLinkDTO> findClinicsForProcedure(
            double latitude, double longitude, String procedureId, String state) {

        if (state == null || state.isBlank()) return Collections.emptyList();

        List<ClinicPublicDTO> clinics =
                adminClinicClient.getClinicsByState(state, null).getData();

        if (clinics == null) return Collections.emptyList();

        List<String> clinicIds =
                procedureServiceClient.getClinicIdsByProcedure(procedureId).getData();

        if (clinicIds == null || clinicIds.isEmpty()) return Collections.emptyList();

        Set<String> allowedIds = Set.copyOf(clinicIds);

        return clinics.stream()
                .filter(ClinicPublicDTO::isOnline)
                .filter(c -> allowedIds.contains(c.getClinicId()))
                .map(c -> mapClinicWithPricing(c, latitude, longitude, procedureId, true))
                .sorted(this::sortByDistance)
                .toList();
    }

    // =========================================================
    // Find clinics offering a package
    // =========================================================
//    @Override
//    public List<ClinicProcedureLinkDTO> findClinicsForPackage(
//            double latitude, double longitude, String packageId) {
//
//        String state = reverseGeoService.resolveState(latitude, longitude);
//        List<ClinicPublicDTO> clinics =
//                adminClinicClient.getClinicsByState(state, null).getData();
//
//        if (clinics == null) return Collections.emptyList();
//
//        List<String> clinicIds =
//                procedureServiceClient.getClinicIdsByPackage(packageId).getData();
//
//        if (clinicIds == null || clinicIds.isEmpty()) return Collections.emptyList();
//
//        Set<String> allowedIds = Set.copyOf(clinicIds);
//
//        return clinics.stream()
//                .filter(ClinicPublicDTO::isOnline)
//                .filter(c -> allowedIds.contains(c.getClinicId()))
//                .map(c -> mapClinicWithPricing(c, latitude, longitude, packageId, false))
//                .sorted(this::sortByDistance)
//                .toList();
//    }

    // =========================================================
    // Nearby clinics
    // =========================================================
    @Override
    public List<ClinicProcedureLinkDTO> findNearbyClinics(
            double latitude, double longitude, String state) {

        if (state == null || state.isBlank()) return Collections.emptyList();

        List<ClinicPublicDTO> clinics =
                adminClinicClient.getClinicsByState(state, true).getData();

        if (clinics == null) return Collections.emptyList();

        return clinics.stream()
                .map(c -> mapClinicToDTO(c, latitude, longitude, null))
                .sorted(this::sortByDistance)
                .toList();
    }

    // =========================================================
    // Nearby clinics WITH OFFERS
    // =========================================================
    @Override
    public List<ClinicProcedureLinkDTO> findNearbyClinicsWithOffers(
            double latitude, double longitude, String state) {

        if (state == null || state.isBlank()) return Collections.emptyList();

        List<ClinicPublicDTO> clinics =
                adminClinicClient.getClinicsByState(state, true).getData();

        if (clinics == null) return Collections.emptyList();

        return clinics.stream()
                .filter(c -> hasAnyActiveOffer(c.getClinicId()))
                .map(c -> mapClinicToDTO(c, latitude, longitude, null))
                .sorted(this::sortByDistance)
                .toList();
    }


    // =========================================================
    // Clinic details
    // =========================================================
    @Override
    public ClinicDetailsDTO getClinicDetails(String clinicId) {

        List<ProcedurePackageDTO> packages =
                safeGet(() -> procedureServiceClient.getPackagesByClinic(clinicId).getData());

        List<ProcedurePricingDTO> procedures =
                safeGet(() -> procedureServiceClient.getProceduresByClinic(clinicId).getData());

        return new ClinicDetailsDTO(packages, procedures);
    }

    // =========================================================
    // Clinic OFFERS only
    // =========================================================
    @Override
    public ClinicDetailsDTO getClinicOffers(String clinicId) {

        List<ProcedurePricingDTO> procedures =
                safeGet(() -> procedureServiceClient.getProceduresByClinic(clinicId).getData())
                        .stream().filter(this::isOfferActive).toList();

        List<ProcedurePackageDTO> packages =
                safeGet(() -> procedureServiceClient.getPackagesByClinic(clinicId).getData())
                        .stream().filter(this::isOfferActive).toList();

        return new ClinicDetailsDTO(packages, procedures);
    }

    // =========================================================
    // Helpers
    // =========================================================

    private ClinicProcedureLinkDTO mapClinicWithPricing(
            ClinicPublicDTO clinic,
            double latitude,
            double longitude,
            String id,
            boolean isProcedure) {

        ProcedurePricingDTO pricing = null;

        try {
            if (isProcedure) {
                pricing = procedureServiceClient
                        .getPricingByProcedureForClinic(id, clinic.getClinicId())
                        .getData();
            } else {
                pricing = procedureServiceClient
                        .getPackagePricingForClinic(clinic.getClinicId(), id)
                        .getData();
            }

            // ✅ ADD PLATFORM FEE INTO FINAL COST
            if (pricing != null && pricing.getPlatformFee() > 0) {
                pricing.setFinalCost(
                        pricing.getFinalCost() + pricing.getPlatformFee()
                );
            }

        } catch (Exception ignored) {}

        return mapClinicToDTO(clinic, latitude, longitude, pricing);
    }



    private ClinicProcedureLinkDTO mapClinicToDTO(
            ClinicPublicDTO clinic,
            double latitude,
            double longitude,
            ProcedurePricingDTO pricing) {

        double distanceKm =
                calculateDistanceInKm(latitude, longitude,
                        clinic.getLatitude(), clinic.getLongitude());

        String distanceStr =
                distanceKm < 1
                        ? Math.round(distanceKm * 1000) + " M"
                        : Math.round(distanceKm) + " KM";

        return ClinicProcedureLinkDTO.builder()
                .clinicId(clinic.getClinicId())
                .name(clinic.getName())
                .address(clinic.getAddress())
                .city(clinic.getCity())
                .state(clinic.getState())
                .latitude(clinic.getLatitude())
                .longitude(clinic.getLongitude())

                // contact
                .contactNumber(clinic.getContactNumber())
                .whatsappNumber(clinic.getWhatsappNumber())
                .email(clinic.getEmail())
                .alternateContactNumber(clinic.getAlternateContactNumber())

                // timings
                .openingTime(clinic.getOpeningTime())
                .closingTime(clinic.getClosingTime())

                // media & web
                .hospitalLogo(clinic.getHospitalLogo())
                .website(clinic.getWebsite())
                .walkthrough(clinic.getWalkthrough())

                // ratings & status
                .hospitalOverallRating(clinic.getHospitalOverallRating())
                .online(clinic.isOnline())
                .recommended(clinic.isRecommended())
                .subscription(clinic.getSubscription())
                .status(clinic.getStatus())
                .username(clinic.getUsername())
                .role(clinic.getRole())

                // license & compliance
                .licenseNumber(clinic.getLicenseNumber())
                .issuingAuthority(clinic.getIssuingAuthority())
                .clinicType(clinic.getClinicType())
                .medicinesSoldOnSite(clinic.getMedicinesSoldOnSite())
                .drugLicenseFormType(clinic.getDrugLicenseFormType())
                .hasPharmacist(clinic.getHasPharmacist())
                .nabhScore(clinic.getNabhScore())

                // branch & admin
                .branch(clinic.getBranch())
                .primaryContactPerson(clinic.getPrimaryContactPerson())
                .designation(clinic.getDesignation())
                .clinicManagementSoftwareUsage(clinic.getClinicManagementSoftwareUsage())
                .createdAt(clinic.getCreatedAt())

                // social
                .instagramHandle(clinic.getInstagramHandle())
                .twitterHandle(clinic.getTwitterHandle())
                .facebookHandle(clinic.getFacebookHandle())

                // doctors
                .doctorsList(clinic.getDoctorsList())

                // pricing & offers
                .procedurePricing(pricing)
                .maxOfferPercentage(calculateMaxOfferForClinic(clinic.getClinicId()))

                // distance
                .distanceInKm(distanceStr)

                .build();
    }


    // =========================================================
    // Offer logic
    // =========================================================
    private boolean hasAnyActiveOffer(String clinicId) {
        return calculateMaxOfferForClinic(clinicId) != null;
    }

    private final Map<String, Double> offerCache = new ConcurrentHashMap<>();

    private Double calculateMaxOfferForClinic(String clinicId) {

        return offerCache.computeIfAbsent(clinicId, id -> {

            double max = 0;

            for (ProcedurePricingDTO p :
                    safeGet(() -> procedureServiceClient.getProceduresByClinic(id).getData())) {
                if (isOfferActive(p)) {
                    max = Math.max(max, p.getTotalDiscountPercentage());
                }
            }

            for (ProcedurePackageDTO p :
                    safeGet(() -> procedureServiceClient.getPackagesByClinic(id).getData())) {
                if (isOfferActive(p)) {
                    max = Math.max(max, p.getTotalDiscountPercentage());
                }
            }

            return max > 0 ? max : null;
        });
    }


    private boolean isOfferActive(ProcedurePricingDTO p) {
        return p.isOfferActive()
                && p.getTotalDiscountPercentage() > 0
                && !isExpired(p.getOfferValidDate());
    }

    private boolean isOfferActive(ProcedurePackageDTO p) {
        return p.isOfferActive()
                && p.getTotalDiscountPercentage() > 0
                && !isExpired(p.getOfferValidDate());
    }


    private boolean isExpired(String date) {
        if (date == null || date.isBlank()) return false;

        try {
            LocalDate localDate = LocalDate.parse(date); // yyyy-MM-dd
            LocalDateTime endOfDay = localDate.atTime(23, 59, 59);
            Instant offerInstant = endOfDay.toInstant(ZoneOffset.UTC);
            return Instant.now().isAfter(offerInstant);
        } catch (DateTimeParseException e) {
            // If parsing fails, assume expired to be safe
            return true;
        }
    }

    // =========================================================
    // Utility
    // =========================================================
    private int sortByDistance(ClinicProcedureLinkDTO a, ClinicProcedureLinkDTO b) {
        return Double.compare(parseDistance(a.getDistanceInKm()),
                              parseDistance(b.getDistanceInKm()));
    }

    private double parseDistance(String distance) {

        distance = distance.trim();

        if (distance.endsWith(" KM")) {
            return Double.parseDouble(distance.replace(" KM", ""));
        }

        if (distance.endsWith(" M")) {
            return Double.parseDouble(distance.replace(" M", "")) / 1000;
        }

        return Double.MAX_VALUE; // fallback safety
    }


    private double calculateDistanceInKm(
            double lat1, double lon1, double lat2, double lon2) {

        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }

    private <T> List<T> safeGet(SupplierWithException<List<T>> supplier) {
        try {
            List<T> data = supplier.get();
            return data != null ? data : Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @FunctionalInterface
    private interface SupplierWithException<T> {
        T get() throws Exception;
    }

//    @Override
//    public List<ProcedurePackageWithClinicsDTO> getAllPackagesWithClinics(
//            double latitude, double longitude, String state) {
//
//        if (state == null || state.isBlank()) return Collections.emptyList();
//
//        List<ClinicPublicDTO> clinics =
//                adminClinicClient.getClinicsByState(state, true).getData();
//
//        if (clinics == null || clinics.isEmpty()) return Collections.emptyList();
//
//        List<ProcedurePackageDTO> packages =
//                procedureServiceClient.getAllPackages().getData();
//
//        if (packages == null || packages.isEmpty()) return Collections.emptyList();
//
//        // mapping logic stays the same
//        return packages.stream()
//                .map(pkg -> mapPackageWithClinics(pkg, clinics, latitude, longitude))
//                .filter(Objects::nonNull)
//                .toList();
//    }

    @Override
    public List<ClinicProcedureLinkDTO> getAllClinics(
            double latitude, double longitude, String state) {

        if (state == null || state.isBlank()) return Collections.emptyList();

        List<ClinicPublicDTO> clinics =
                adminClinicClient.getClinicsByState(state, true).getData();

        if (clinics == null || clinics.isEmpty()) return Collections.emptyList();

        List<ProcedurePackageDTO> packages =
                procedureServiceClient.getAllPackages().getData();

        if (packages == null || packages.isEmpty()) return Collections.emptyList();

        Set<String> allClinicIds = new HashSet<>();

        for (ProcedurePackageDTO pkg : packages) {
            try {
                List<String> clinicIds =
                        procedureServiceClient.getClinicIdsByPackage(pkg.getPackageId()).getData();

                if (clinicIds != null) {
                    allClinicIds.addAll(clinicIds);
                }
            } catch (Exception ignored) {
            }
        }

        return clinics.stream()
                .filter(c -> allClinicIds.contains(c.getClinicId()))
                .map(c -> mapClinicToDTO(c, latitude, longitude, null))
                .sorted(Comparator.comparingDouble(c ->
                        parseDistance(c.getDistanceInKm())))
                .toList();
    }

    
    private ProcedurePackageWithClinicsDTO mapPackageWithClinics(
            ProcedurePackageDTO pkg,
            List<ClinicPublicDTO> clinics,
            double latitude,
            double longitude) {

        // Add platform fee if any
        if (pkg.getPlatformFee() > 0) {
            pkg.setFinalCost(pkg.getFinalCost() + pkg.getPlatformFee());
        }

        List<String> clinicIds;
        try {
            clinicIds = procedureServiceClient.getClinicIdsByPackage(pkg.getPackageId()).getData();
        } catch (Exception e) {
            clinicIds = Collections.emptyList();
        }

        Set<String> clinicSet = clinicIds != null ? Set.copyOf(clinicIds) : Set.of();

        // Map clinics WITHOUT procedurePricing
        List<ClinicProcedureLinkDTO> clinicDtos = clinics.stream()
                .filter(c -> clinicSet.contains(c.getClinicId()))
                .map(c -> mapClinicToDTO(c, latitude, longitude, null))
                .sorted((a, b) -> Double.compare(
                        parseDistance(a.getDistanceInKm()),
                        parseDistance(b.getDistanceInKm())
                ))
                .toList();

        if (clinicDtos.isEmpty()) return null;

        ProcedurePackageWithClinicsDTO dto = new ProcedurePackageWithClinicsDTO();
        dto.setPackageInfo(pkg);
        dto.setClinics(clinicDtos);
        return dto;
    }

}