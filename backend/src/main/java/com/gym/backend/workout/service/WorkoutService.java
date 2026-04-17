package com.gym.backend.workout.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gym.backend.auth.model.User;
import com.gym.backend.auth.repository.UserRepository;
import com.gym.backend.common.exception.ResourceNotFoundException;
import com.gym.backend.workout.dto.WorkoutLogRequest;
import com.gym.backend.workout.dto.WorkoutLogResponse;
import com.gym.backend.workout.model.WorkoutLog;
import com.gym.backend.workout.repository.WorkoutLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutLogRepository workoutLogRepository;
    private final UserRepository userRepository;

    public WorkoutLogResponse addLog(String email, WorkoutLogRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        WorkoutLog log = WorkoutLog.builder()
                .user(user)
                .workoutDate(request.getWorkoutDate())
                .exerciseName(request.getExerciseName())
                .weightKg(request.getWeightKg())
                .sets(request.getSets())
                .reps(request.getReps())
                .durationMinutes(request.getDurationMinutes())
                .notes(request.getNotes())
                .build();

        workoutLogRepository.save(log);
        return toResponse(log);
    }

    public List<WorkoutLogResponse> getAllLogs(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        return workoutLogRepository
                .findByUserIdOrderByWorkoutDateDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<WorkoutLogResponse> getLogsByDate(String email, LocalDate date) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        return workoutLogRepository
                .findByUserIdAndWorkoutDateOrderByCreatedAtDesc(user.getId(), date)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<WorkoutLogResponse> getLogsByRange(
            String email, LocalDate startDate, LocalDate endDate) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        return workoutLogRepository
                .findByUserIdAndWorkoutDateBetweenOrderByWorkoutDateDesc(
                        user.getId(), startDate, endDate)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void deleteLog(String email, Long logId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        WorkoutLog log = workoutLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Log tidak ditemukan"));

        // Pastikan log milik user yang sedang login
        if (!log.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Log tidak ditemukan");
        }

        workoutLogRepository.delete(log);
    }

    private WorkoutLogResponse toResponse(WorkoutLog log) {
        return WorkoutLogResponse.builder()
                .id(log.getId())
                .workoutDate(log.getWorkoutDate())
                .exerciseName(log.getExerciseName())
                .weightKg(log.getWeightKg())
                .sets(log.getSets())
                .reps(log.getReps())
                .durationMinutes(log.getDurationMinutes())
                .notes(log.getNotes())
                .createdAt(log.getCreatedAt())
                .build();
    }
}