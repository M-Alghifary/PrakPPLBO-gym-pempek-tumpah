package com.gym.backend.workout.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gym.backend.common.response.ApiResponse;
import com.gym.backend.workout.dto.WorkoutLogRequest;
import com.gym.backend.workout.dto.WorkoutLogResponse;
import com.gym.backend.workout.service.WorkoutService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workout")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @PostMapping("/logs")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<WorkoutLogResponse>> addLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody WorkoutLogRequest request) {

        WorkoutLogResponse response =
                workoutService.addLog(userDetails.getUsername(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Log workout berhasil ditambahkan", response));
    }

    @GetMapping("/logs")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<List<WorkoutLogResponse>>> getAllLogs(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<WorkoutLogResponse> logs =
                workoutService.getAllLogs(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Semua log workout", logs));
    }

    @GetMapping("/logs/date/{date}")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<List<WorkoutLogResponse>>> getLogsByDate(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<WorkoutLogResponse> logs =
                workoutService.getLogsByDate(userDetails.getUsername(), date);
        return ResponseEntity.ok(
                ApiResponse.success("Log workout tanggal " + date, logs));
    }

    @GetMapping("/logs/range")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<List<WorkoutLogResponse>>> getLogsByRange(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<WorkoutLogResponse> logs =
                workoutService.getLogsByRange(userDetails.getUsername(), startDate, endDate);
        return ResponseEntity.ok(
                ApiResponse.success("Log workout " + startDate + " s/d " + endDate, logs));
    }

    @DeleteMapping("/logs/{logId}")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<Void>> deleteLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long logId) {

        workoutService.deleteLog(userDetails.getUsername(), logId);
        return ResponseEntity.ok(ApiResponse.success("Log workout dihapus"));
    }
}