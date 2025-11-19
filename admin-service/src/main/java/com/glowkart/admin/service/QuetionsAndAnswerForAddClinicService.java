package com.glowkart.admin.service;

import com.glowkart.admin.dto.QuetionsAndAnswerForAddClinicDTO;
import com.glowkart.admin.util.Response;

public interface QuetionsAndAnswerForAddClinicService {

	Response saveQuetions(QuetionsAndAnswerForAddClinicDTO dto);

	Response updateQuetions(QuetionsAndAnswerForAddClinicDTO dto);

	Response getQuetions();

}
