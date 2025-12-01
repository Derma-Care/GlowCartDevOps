package com.glowkart.admin.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.glowkart.admin.dto.WheelSliceDto;
import com.glowkart.admin.model.WheelSliceYes;
import com.glowkart.admin.model.WheelSliceInterested;
import com.glowkart.admin.repo.WheelSliceYesRepository;
import com.glowkart.admin.repo.WheelSliceInterestedRepository;

@Service
public class WheelSliceService {

    private final WheelSliceYesRepository yesRepository;
    private final WheelSliceInterestedRepository interestedRepository;

    public WheelSliceService(WheelSliceYesRepository yesRepository, WheelSliceInterestedRepository interestedRepository) {
        this.yesRepository = yesRepository;
        this.interestedRepository = interestedRepository;
    }

    // ================== YES ==================
    public List<WheelSliceDto> getYesSlices() {
        return yesRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<WheelSliceDto> getYesSliceById(String id) {
        return yesRepository.findById(id).map(this::toDto);
    }

    public WheelSliceDto createYesSlice(WheelSliceDto dto) {
        WheelSliceYes slice = new WheelSliceYes();
        slice.setOption(dto.getOption());
        slice.setSrc(dto.getSrc());
        return toDto(yesRepository.save(slice));
    }

    public WheelSliceDto updateYesSlice(String id, WheelSliceDto dto) {
        return yesRepository.findById(id).map(slice -> {
            slice.setOption(dto.getOption());
            slice.setSrc(dto.getSrc());
            return toDto(yesRepository.save(slice));
        }).orElseThrow(() -> new RuntimeException("YES slice not found"));
    }

    public void deleteYesSlice(String id) {
        yesRepository.deleteById(id);
    }

    // ================== INTERESTED ==================
    public List<WheelSliceDto> getInterestedSlices() {
        return interestedRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<WheelSliceDto> getInterestedSliceById(String id) {
        return interestedRepository.findById(id).map(this::toDto);
    }

    public WheelSliceDto createInterestedSlice(WheelSliceDto dto) {
        WheelSliceInterested slice = new WheelSliceInterested();
        slice.setOption(dto.getOption());
        slice.setSrc(dto.getSrc());
        return toDto(interestedRepository.save(slice));
    }

    public WheelSliceDto updateInterestedSlice(String id, WheelSliceDto dto) {
        return interestedRepository.findById(id).map(slice -> {
            slice.setOption(dto.getOption());
            slice.setSrc(dto.getSrc());
            return toDto(interestedRepository.save(slice));
        }).orElseThrow(() -> new RuntimeException("INTERESTED slice not found"));
    }

    public void deleteInterestedSlice(String id) {
        interestedRepository.deleteById(id);
    }

    // ================== Private helpers ==================
    private WheelSliceDto toDto(WheelSliceYes slice) {
        return new WheelSliceDto(slice.getId(), slice.getOption(), slice.getSrc());
    }

    private WheelSliceDto toDto(WheelSliceInterested slice) {
        return new WheelSliceDto(slice.getId(), slice.getOption(), slice.getSrc());
    }
}
