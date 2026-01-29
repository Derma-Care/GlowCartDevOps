package com.glowkart.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcedurePackageWithClinicsDTO {

    private ProcedurePackageDTO packageInfo;           // original package details
    private List<ClinicProcedureLinkDTO> clinics;      // clinics offering this package, distance-wise

}
