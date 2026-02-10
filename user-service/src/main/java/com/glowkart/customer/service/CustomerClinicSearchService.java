package com.glowkart.customer.service;

import com.glowkart.customer.dto.ClinicDetailsDTO;
import com.glowkart.customer.dto.ClinicProcedureLinkDTO;
import com.glowkart.customer.dto.ProcedurePackageWithClinicsDTO;

import java.util.List;

public interface CustomerClinicSearchService {

    /**
     * Find clinics offering a specific procedure near the given location.
     * @param latitude  User latitude
     * @param longitude User longitude
     * @param procedureId Procedure ID to filter clinics
     * @return List of clinics with pricing, distance, and other details
     */
    List<ClinicProcedureLinkDTO> findClinicsForProcedure(
            double latitude, double longitude, String procedureId, String state);


    /**
     * Find clinics offering a specific package near the given location.
     * @param latitude  User latitude
     * @param longitude User longitude
     * @param packageId Package ID to filter clinics
     * @return List of clinics with pricing, distance, and other details
     */
//    List<ClinicProcedureLinkDTO> findClinicsForPackage(
//            double latitude,
//            double longitude,
//            String packageId
//    );

    /**
     * Fetch all procedure packages along with the clinics offering them
     * sorted by distance from the given location.
     * @param latitude  User latitude
     * @param longitude User longitude
     * @return List of packages with clinic details
     */
    List<ProcedurePackageWithClinicsDTO> getAllPackagesWithClinics(
            double latitude, double longitude, String state);

    List<ClinicProcedureLinkDTO> findNearbyClinics(
            double latitude, double longitude, String state);

    List<ClinicProcedureLinkDTO> findNearbyClinicsWithOffers(
            double latitude, double longitude, String state);

    ClinicDetailsDTO getClinicDetails(String clinicId);

    ClinicDetailsDTO getClinicOffers(String clinicId);

}
