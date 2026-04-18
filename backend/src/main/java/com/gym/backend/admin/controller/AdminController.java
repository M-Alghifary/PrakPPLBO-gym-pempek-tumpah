package com.gym.backend.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gym.backend.admin.dto.AdminMemberResponse;
import com.gym.backend.admin.dto.ReportResponse;
import com.gym.backend.admin.service.AdminService;
import com.gym.backend.common.response.ApiResponse;
import com.gym.backend.schedule.dto.GymClassResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
public class AdminController {

    private final AdminService adminService;

    // Semua member
    @GetMapping("/members")
    public ResponseEntity<ApiResponse<List<AdminMemberResponse>>> getAllMembers() {
        List<AdminMemberResponse> members = adminService.getAllMembers();
        return ResponseEntity.ok(ApiResponse.success("Daftar semua member", members));
    }

    // Update role user
    @PutMapping("/members/{userId}/role")
    public ResponseEntity<ApiResponse<Void>> updateRole(
            @PathVariable Long userId,
            @RequestParam String role) {

        adminService.updateUserRole(userId, role);
        return ResponseEntity.ok(ApiResponse.success("Role berhasil diupdate"));
    }

    // Semua kelas
    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<GymClassResponse>>> getAllClasses() {
        List<GymClassResponse> classes = adminService.getAllClasses();
        return ResponseEntity.ok(ApiResponse.success("Semua kelas", classes));
    }

    // Cancel kelas
    @PutMapping("/classes/{classId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelClass(@PathVariable Long classId) {
        adminService.cancelClass(classId);
        return ResponseEntity.ok(ApiResponse.success("Kelas berhasil dibatalkan"));
    }

    // Laporan
    @GetMapping("/report")
    public ResponseEntity<ApiResponse<ReportResponse>> getReport() {
        ReportResponse report = adminService.getReport();
        return ResponseEntity.ok(ApiResponse.success("Laporan sistem", report));
    }
}