package com.glowkart.procedure.service;

import com.glowkart.procedure.dto.ProcedureDTO;
import com.glowkart.procedure.exception.BadRequestException;
import com.glowkart.procedure.exception.DuplicateResourceException;
import com.glowkart.procedure.exception.ResourceNotFoundException;
import com.glowkart.procedure.model.Procedure;
import com.glowkart.procedure.model.ProcedurePricing;
import com.glowkart.procedure.repo.ProcedurePricingRepository;
import com.glowkart.procedure.repo.ProcedureRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProcedureServiceImpl implements ProcedureService {

	private final ProcedureRepository repo;
	private final ProcedurePricingRepository pricingRepository;  // add this

	public ProcedureServiceImpl(ProcedureRepository repo,
	                            ProcedurePricingRepository pricingRepository) {
	    this.repo = repo;
	    this.pricingRepository = pricingRepository;
	}


    private ProcedureDTO mapToDTO(Procedure procedure) {
        ProcedureDTO dto = new ProcedureDTO();
        dto.setProcedureId(procedure.getId());
        dto.setProcedureName(procedure.getProcedureName());

        ZoneId istZone = ZoneId.of("Asia/Kolkata");
        dto.setCreatedAt(procedure.getCreatedAt() != null ?
                procedure.getCreatedAt().atZone(ZoneId.of("UTC")).withZoneSameInstant(istZone).toInstant() : null);
        dto.setUpdatedAt(procedure.getUpdatedAt() != null ?
                procedure.getUpdatedAt().atZone(ZoneId.of("UTC")).withZoneSameInstant(istZone).toInstant() : null);

        return dto;
    }

    @Override
    public ProcedureDTO create(ProcedureDTO dto) {
        String name = dto.getProcedureName() != null ? dto.getProcedureName().trim() : "";

        if (name.isEmpty()) {
            throw new BadRequestException("PROCEDURE_NAME_EMPTY", "Procedure name cannot be empty");
        }

        if (repo.existsByProcedureNameIgnoreCase(name)) {
            throw new DuplicateResourceException("PROCEDURE_ALREADY_EXISTS", "Procedure name already exists");
        }

        Procedure procedure = new Procedure();
        procedure.setProcedureName(name);

        Procedure saved = repo.save(procedure);
        return mapToDTO(saved);
    }


    @Override
    public ProcedureDTO update(String procedureId, ProcedureDTO dto) {
        // 1️⃣ Find existing procedure
        Procedure existing = repo.findById(procedureId)
                .orElseThrow(() -> new ResourceNotFoundException("PROCEDURE_NOT_FOUND", "Procedure not found"));

        // 2️⃣ Validate procedure name
        String name = dto.getProcedureName() != null ? dto.getProcedureName().trim() : "";
        if (name.isEmpty()) {
            throw new BadRequestException("PROCEDURE_NAME_EMPTY", "Procedure name cannot be empty");
        }

        // 3️⃣ Check for duplicate names
        if (!existing.getProcedureName().equalsIgnoreCase(name) &&
            repo.existsByProcedureNameIgnoreCase(name)) {
            throw new DuplicateResourceException("PROCEDURE_ALREADY_EXISTS", "Procedure name already exists");
        }

        // 4️⃣ Update procedure name
        String oldName = existing.getProcedureName();
        existing.setProcedureName(name);
        Procedure updated = repo.save(existing);

        // 5️⃣ Sync all procedure pricing records if name changed
        if (!oldName.equals(name)) {
            List<ProcedurePricing> pricings = pricingRepository.findByProcedureId(existing.getId());
            for (ProcedurePricing p : pricings) {
                p.setProcedureName(name);
                p.setUpdatedAt(Instant.now());
                pricingRepository.save(p);
            }
        }

        // 6️⃣ Map and return updated DTO
        return mapToDTO(updated);
    }



    @Override
    public ProcedureDTO getById(String procedureId) {
        Procedure procedure = repo.findById(procedureId)
                .orElseThrow(() -> new ResourceNotFoundException("PROCEDURE_NOT_FOUND", "Procedure not found"));
        return mapToDTO(procedure);
    }

    @Override
    public List<ProcedureDTO> getAll() {
        return repo.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String procedureId) {
        if (!repo.existsById(procedureId)) {
            throw new ResourceNotFoundException("PROCEDURE_NOT_FOUND", "Procedure not found");
        }
        repo.deleteById(procedureId);
    }
}
