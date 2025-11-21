package com.glowkart.admin.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.glowkart.admin.dto.WheelSliceDto;
import com.glowkart.admin.model.WheelSlice;
import com.glowkart.admin.repo.WheelSliceRepository;

@Service
public class WheelSliceService {

    private final WheelSliceRepository repository;

    public WheelSliceService(WheelSliceRepository repository) {
        this.repository = repository;
    }

    public List<WheelSliceDto> getAllSlices() {
        return repository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<WheelSliceDto> getSliceById(String id) {
        return repository.findById(id).map(this::toDto);
    }

    public WheelSliceDto createSlice(WheelSliceDto dto) {
        WheelSlice slice = new WheelSlice(dto.getId(), dto.getOption(), dto.getSrc());
        return toDto(repository.save(slice));
    }

    public WheelSliceDto updateSlice(String id, WheelSliceDto dto) {
        return repository.findById(id).map(slice -> {
            slice.setOption(dto.getOption());
            slice.setSrc(dto.getSrc());
            return toDto(repository.save(slice));
        }).orElseThrow(() -> new RuntimeException("Slice not found with id " + id));
    }

    public void deleteSlice(String id) {
        repository.deleteById(id);
    }

    private WheelSliceDto toDto(WheelSlice slice) {
        return new WheelSliceDto(slice.getId(), slice.getOption(), slice.getSrc());
    }
}
