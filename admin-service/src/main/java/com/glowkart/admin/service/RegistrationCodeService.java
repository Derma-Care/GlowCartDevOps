package com.glowkart.admin.service;

import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.glowkart.admin.dto.RegistrationRequestDTO;
import com.glowkart.admin.dto.RegistrationResponseDTO;
import com.glowkart.admin.model.RegistrationCode;
import com.glowkart.admin.repo.RegistrationCodeRepository;

import jakarta.mail.internet.MimeMessage;

@Service
public class RegistrationCodeService {

    private static final String CODE_PREFIX = "NGK-";
    private static final int MIN_DIGITS = 6;
    private static final int MAX_DIGITS = 16;

    @Autowired
    private RegistrationCodeRepository repo;

    @Autowired
    private JavaMailSender mailSender;

    private final Random random = new SecureRandom();

    // ----------------------
    // Generate batch of unique codes
    // ----------------------
    public List<RegistrationCode> generateAndSaveBatch(int batchSize) {
        Set<RegistrationCode> newCodes = new HashSet<>();

        while (newCodes.size() < batchSize) {
            String code = CODE_PREFIX + generateRandomNumberString(
                    MIN_DIGITS + random.nextInt(MAX_DIGITS - MIN_DIGITS + 1)
            );

            if (!repo.existsByCode(code) && newCodes.stream().noneMatch(c -> c.getCode().equals(code))) {
                newCodes.add(new RegistrationCode(code));
            }
        }

        return repo.saveAll(newCodes);
    }


    @Transactional(readOnly = true)
    public RegistrationResponseDTO verifyCode(RegistrationRequestDTO dto) {
        RegistrationCode code = repo.findByCode(dto.getCode());

        if (code == null) {
            return new RegistrationResponseDTO(dto.getCode(), false, false); // invalid
        }

        return new RegistrationResponseDTO(code.getCode(), code.isUsed(), true); // valid
    }

    @Transactional
    public RegistrationResponseDTO markCodeUsed(String codeStr) {
        RegistrationCode code = repo.findByCode(codeStr);
        if (code == null) {
            return new RegistrationResponseDTO(codeStr, false, false); // invalid
        }
        if (!code.isUsed()) {
            code.setUsed(true);
            repo.save(code);
        }
        return new RegistrationResponseDTO(codeStr, true, true); // valid & used
    }

    public List<RegistrationResponseDTOWithCode> getAllCodes() {
        return repo.findAll().stream()
                .map(c -> new RegistrationResponseDTOWithCode(c.getCode(), c.isUsed()))
                .collect(Collectors.toList());
    }

    // ----------------------
    // Helper: generate random numeric string
    // ----------------------
    private String generateRandomNumberString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(10));
        }
        if (sb.charAt(0) == '0') sb.setCharAt(0, (char) ('1' + random.nextInt(9)));
        return sb.toString();
    }

    // ----------------------
    // Send codes as Excel attachment via email
    // ----------------------
    public void sendCodesByEmail(List<RegistrationCode> codes, String emailTo) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(); var out = new java.io.ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Registration Codes");

            // Header row
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Code");
            header.createCell(1).setCellValue("Used");

            // Data rows
            for (int i = 0; i < codes.size(); i++) {
                RegistrationCode reg = codes.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(reg.getCode());
                row.createCell(1).setCellValue(reg.isUsed() ? "Yes" : "No");
            }

            for (int i = 0; i < 2; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            ByteArrayResource resource = new ByteArrayResource(out.toByteArray());

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(emailTo);
            helper.setSubject("GlowKart Registration Codes");
            helper.setText("Please find attached the registration codes Excel file.");
            helper.addAttachment("RegistrationCodes.xlsx", resource);

            mailSender.send(message);
        }
    }

    // ----------------------
    // DTO for listing all codes
    // ----------------------
    public static class RegistrationResponseDTOWithCode {
        private String code;
        private boolean used;

        public RegistrationResponseDTOWithCode(String code, boolean used) {
            this.code = code;
            this.used = used;
        }

        public String getCode() { return code; }
        public boolean isUsed() { return used; }
    }
}
