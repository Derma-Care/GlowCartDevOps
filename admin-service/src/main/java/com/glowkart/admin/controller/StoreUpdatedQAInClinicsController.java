package com.glowkart.admin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.glowkart.admin.dto.StoreUpdatedQAInClinicsDTO;
import com.glowkart.admin.service.StoreUpdatedQAInClinicsService;
import com.glowkart.admin.util.Response;

@RestController
@RequestMapping("/admin")
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class StoreUpdatedQAInClinicsController {

    @Autowired
    private StoreUpdatedQAInClinicsService storeUpdatedQAInClinicsService;

    // ✅ Save Questions and Answers
    @PostMapping("clinicQA/postQuestionsAndAnswer")
    public ResponseEntity<Response> saveQuestions(@RequestBody StoreUpdatedQAInClinicsDTO dto) {
        Response response = storeUpdatedQAInClinicsService.saveQaAndAnswers(dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    // ✅ Update Questions and Answers by Id
    @PutMapping("clinicQA/updateQuestionsAndAnswer/{id}")
    public ResponseEntity<Response> updateQA(@PathVariable String id, @RequestBody StoreUpdatedQAInClinicsDTO dto) {
        Response response = storeUpdatedQAInClinicsService.updateQaAndAnswers(id, dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    // ✅ Get Q&A by Id
    @GetMapping("clinicQA/getQuestionsAndAnswerById/{id}")
    public ResponseEntity<Response> getById(@PathVariable String id) {
        Response response = storeUpdatedQAInClinicsService.getById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    // ✅ Get All Q&A
    @GetMapping("getAllQuestionsAndAnswer")
    public ResponseEntity<Response> getAll() {
        Response response = storeUpdatedQAInClinicsService.getAll();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    // ✅ Delete Q&A by Id
    @DeleteMapping("deleteQuestionsAndAnswer/{id}")
    public ResponseEntity<Response> deleteById(@PathVariable String id) {
        Response response = storeUpdatedQAInClinicsService.deleteById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
