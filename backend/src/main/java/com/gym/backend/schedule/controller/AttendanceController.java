package com.gym.backend.schedule.controller;

import com.gym.backend.common.response.ApiResponse;
import com.gym.backend.schedule.dto.AttendanceResponse;
import com.gym.backend.schedule.dto.QrCodeResponse;
import com.gym.backend.schedule.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // Admin/Trainer generate QR untuk kelas
    @GetMapping("/qr/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<QrCodeResponse>> generateQr(
            @PathVariable Long classId) {

        QrCodeResponse response = attendanceService.generateQrCode(classId);
        return ResponseEntity.ok(ApiResponse.success("QR Code berhasil digenerate", response));
    }

    // Member scan QR — submit classId setelah scan
    @PostMapping("/scan/{classId}")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> scan(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long classId) {

        AttendanceResponse response =
                attendanceService.scanQrCode(userDetails.getUsername(), classId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Presensi berhasil dicatat", response));
    }

    // Admin/Trainer lihat presensi per kelas
    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getClassAttendances(
            @PathVariable Long classId) {

        List<AttendanceResponse> attendances =
                attendanceService.getClassAttendances(classId);
        return ResponseEntity.ok(
                ApiResponse.success("Daftar presensi kelas", attendances));
    }

    // Member lihat riwayat presensinya sendiri
    @GetMapping("/my-attendances")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getMyAttendances(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<AttendanceResponse> attendances =
                attendanceService.getMyAttendances(userDetails.getUsername());
        return ResponseEntity.ok(
                ApiResponse.success("Riwayat presensi saya", attendances));
    }
}