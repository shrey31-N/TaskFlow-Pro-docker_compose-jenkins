package com.taskflow.userservice.controller;

import com.taskflow.userservice.dto.ChangePasswordRequest;
import com.taskflow.userservice.dto.CreateUserRequest;
import com.taskflow.userservice.dto.LoginRequest;
import com.taskflow.userservice.dto.LoginResponse;
import com.taskflow.userservice.dto.MessageResponse;
import com.taskflow.userservice.dto.UpdateUserRequest;
import com.taskflow.userservice.dto.UserResponse;
import com.taskflow.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Service", description = "User registration, authentication and profile management")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Register a new user")
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Login and obtain a JWT")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Register an Admin account using the shared admin secret key. Not linked from the " +
            "UI - for bootstrapping/ops use only (e.g. via curl or Postman).")
    @PostMapping("/register-admin")
    public ResponseEntity<UserResponse> registerAdmin(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.registerAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Promote an existing user to Admin. Admin-only.")
    @PutMapping("/{id}/promote-to-admin")
    public ResponseEntity<UserResponse> promoteToAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(userService.promoteToAdmin(id));
    }

    @Operation(summary = "List all users. Admin-only - backs the Users admin screen.")
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @Operation(summary = "Get the currently authenticated user's profile")
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    @Operation(summary = "Update the currently authenticated user's profile")
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @Operation(summary = "Change the currently authenticated user's password")
    @PostMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(MessageResponse.builder().message("Password changed successfully").build());
    }

    @Operation(summary = "Upload a profile image for the currently authenticated user")
    @PostMapping("/profile-image")
    public ResponseEntity<UserResponse> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateProfileImage(file));
    }

    @Operation(summary = "Get a user by id (used internally by other services)")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
