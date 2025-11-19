package com.glowkart.admin.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.glowkart.admin.dto.QuestionAnswerDTO;
import com.glowkart.admin.dto.StoreUpdatedQAInClinicsDTO;
import com.glowkart.admin.model.QuestionAnswer;
import com.glowkart.admin.model.StoreUpdatedQAInClinics;
import com.glowkart.admin.repo.StoreUpdatedQAInClinicsRepository;
import com.glowkart.admin.util.Response;

@Service
public class StoreUpdatedQAInClinicsServiceImpl implements StoreUpdatedQAInClinicsService {

    @Autowired
    private StoreUpdatedQAInClinicsRepository storeUpdatedQAInClinicsRepository;

    @Override
    public Response saveQaAndAnswers(StoreUpdatedQAInClinicsDTO dto) {
        Response response = new Response();

        try {
            // Create and save entity
            StoreUpdatedQAInClinics storeQA = new StoreUpdatedQAInClinics();
            List<QuestionAnswer> ansFromDTO = dto.getQuestionsAndAnswers().stream()
                    .map(a -> new QuestionAnswer(a.getQuestion(), a.isAnswer()))
                    .collect(Collectors.toList());
            storeQA.setQuestionsAndAnswers(ansFromDTO);
         
            // Calculate count and score
            long trueCount = ansFromDTO.stream()
                    .filter(QuestionAnswer::isAnswer)
                    .count();
            double rawScore = (trueCount > 0) ? (trueCount / 2.0) : 0.0;
            long score = Math.round(rawScore);

            storeQA.setCount((int) trueCount);
            storeQA.setScore((int) score);
            storeQA.setSubmitedQA(true);

            // Save to DB
            StoreUpdatedQAInClinics savedQA = storeUpdatedQAInClinicsRepository.save(storeQA);

            // Convert to DTO
            StoreUpdatedQAInClinicsDTO responseDTO = new StoreUpdatedQAInClinicsDTO();
            responseDTO.setId(savedQA.getId());
            List<QuestionAnswerDTO> qaDTO = savedQA.getQuestionsAndAnswers().stream()
                    .map(b -> new QuestionAnswerDTO(b.getQuestion(), b.isAnswer()))
                    .collect(Collectors.toList());
            responseDTO.setQuestionsAndAnswers(qaDTO);
            responseDTO.setCount(savedQA.getCount());
            responseDTO.setScore(savedQA.getScore());
            responseDTO.setSubmitedQA(savedQA.isSubmitedQA());

            // Success response
            response.setSuccess(true);
            response.setData(responseDTO);
            response.setMessage("Questions and answers stored successfully");
            response.setStatus(200);

        } catch (Exception ex) {
            // Handle errors gracefully
            response.setSuccess(false);
            response.setData(null);
            response.setMessage("An error occurred while saving Q&A: " + ex.getMessage());
            response.setStatus(500);
        }

        return response;
    }

    @Override
    public Response updateQaAndAnswers(String id, StoreUpdatedQAInClinicsDTO dto) {
        Response response = new Response();

        try {
            Optional<StoreUpdatedQAInClinics> existingQAOpt = storeUpdatedQAInClinicsRepository.findById(id);
            if (existingQAOpt.isEmpty()) {
                response.setSuccess(false);
                response.setMessage("No Q&A found for id: " + id);
                response.setStatus(404);
                return response;
            }

            StoreUpdatedQAInClinics existingQA = existingQAOpt.get();

            // Replace with updated answers
            List<QuestionAnswer> updatedList = dto.getQuestionsAndAnswers().stream()
                    .map(a -> new QuestionAnswer(a.getQuestion(), a.isAnswer()))
                    .collect(Collectors.toList());

            existingQA.setQuestionsAndAnswers(updatedList);

            // Calculate count and score
            long trueCount = existingQA.getQuestionsAndAnswers().stream()
                    .filter(QuestionAnswer::isAnswer)
                    .count();
            double rawScore = (trueCount > 0) ? (trueCount / 2.0) : 0.0;
            long score = Math.round(rawScore);

            existingQA.setCount((int) trueCount);
            existingQA.setScore((int) score);

            StoreUpdatedQAInClinics savedQA = storeUpdatedQAInClinicsRepository.save(existingQA);

            // Convert updated entity to DTO
            StoreUpdatedQAInClinicsDTO responseDTO = new StoreUpdatedQAInClinicsDTO();
            responseDTO.setId(savedQA.getId());
            List<QuestionAnswerDTO> qaDTO = savedQA.getQuestionsAndAnswers().stream()
                    .map(b -> new QuestionAnswerDTO(b.getQuestion(), b.isAnswer()))
                    .collect(Collectors.toList());
            responseDTO.setQuestionsAndAnswers(qaDTO);
            responseDTO.setCount((int) trueCount);
            responseDTO.setScore((int) score);

            // Success response
            response.setSuccess(true);
            response.setData(responseDTO);
            response.setMessage("Q&A updated successfully with count and score");
            response.setStatus(200);

        } catch (Exception ex) {
            response.setSuccess(false);
            response.setMessage("Error while updating Q&A: " + ex.getMessage());
            response.setStatus(500);
        }

        return response;
    }

    @Override
    public Response getById(String id) {
        Response response = new Response();

        try {
            Optional<StoreUpdatedQAInClinics> qaOpt = storeUpdatedQAInClinicsRepository.findById(id);
            if (qaOpt.isEmpty()) {
                response.setSuccess(false);
                response.setMessage("No Q&A found for id: " + id);
                response.setStatus(404);
                return response;
            }

            StoreUpdatedQAInClinics qa = qaOpt.get();

            // Convert entity to DTO
            StoreUpdatedQAInClinicsDTO responseDTO = new StoreUpdatedQAInClinicsDTO();
            responseDTO.setId(qa.getId());
            List<QuestionAnswerDTO> qaDTO = qa.getQuestionsAndAnswers().stream()
                    .map(b -> new QuestionAnswerDTO(b.getQuestion(), b.isAnswer()))
                    .collect(Collectors.toList());
            responseDTO.setQuestionsAndAnswers(qaDTO);
            responseDTO.setCount(qa.getCount());
            responseDTO.setScore(qa.getScore());

            // Success response
            response.setSuccess(true);
            response.setData(responseDTO);
            response.setMessage("Q&A retrieved successfully");
            response.setStatus(200);

        } catch (Exception ex) {
            response.setSuccess(false);
            response.setMessage("Error while retrieving Q&A: " + ex.getMessage());
            response.setStatus(500);
        }

        return response;
    }

    @Override
    public Response getAll() {
        Response response = new Response();

        try {
            List<StoreUpdatedQAInClinics> allQAs = storeUpdatedQAInClinicsRepository.findAll();

            // Convert entities to DTOs
            List<StoreUpdatedQAInClinicsDTO> dtoList = allQAs.stream().map(qa -> {
                StoreUpdatedQAInClinicsDTO dto = new StoreUpdatedQAInClinicsDTO();
                dto.setId(qa.getId());
                List<QuestionAnswerDTO> qaDTO = qa.getQuestionsAndAnswers().stream()
                        .map(b -> new QuestionAnswerDTO(b.getQuestion(), b.isAnswer()))
                        .collect(Collectors.toList());
                dto.setQuestionsAndAnswers(qaDTO);
                dto.setCount(qa.getCount());
                dto.setScore(qa.getScore());
                return dto;
            }).collect(Collectors.toList());

            // Success response
            response.setSuccess(true);
            response.setData(dtoList);
            response.setMessage("All Q&A retrieved successfully");
            response.setStatus(200);

        } catch (Exception ex) {
            response.setSuccess(false);
            response.setMessage("Error while retrieving all Q&A: " + ex.getMessage());
            response.setStatus(500);
        }

        return response;
    }

    @Override
    public Response deleteById(String id) {
        Response response = new Response();

        try {
            Optional<StoreUpdatedQAInClinics> qaOpt = storeUpdatedQAInClinicsRepository.findById(id);
            if (qaOpt.isEmpty()) {
                response.setSuccess(false);
                response.setMessage("No Q&A found for id: " + id);
                response.setStatus(404);
                return response;
            }

            storeUpdatedQAInClinicsRepository.deleteById(id);

            // Success response
            response.setSuccess(true);
            response.setMessage("Q&A deleted successfully for id: " + id);
            response.setStatus(200);

        } catch (Exception ex) {
            response.setSuccess(false);
            response.setMessage("Error while deleting Q&A: " + ex.getMessage());
            response.setStatus(500);
        }

        return response;
    }
}
