package com.taskflow.userservice.service;

import com.taskflow.userservice.dto.ChangePasswordRequest;
import com.taskflow.userservice.dto.CreateUserRequest;
import com.taskflow.userservice.dto.LoginRequest;
import com.taskflow.userservice.dto.LoginResponse;
import com.taskflow.userservice.dto.UpdateUserRequest;
import com.taskflow.userservice.dto.UserResponse;
import com.taskflow.userservice.entity.Role;
import com.taskflow.userservice.entity.User;
import com.taskflow.userservice.exception.EmailAlreadyExistsException;
import com.taskflow.userservice.exception.InvalidAdminSecretKeyException;
import com.taskflow.userservice.exception.InvalidPasswordException;
import com.taskflow.userservice.exception.PasswordMismatchException;
import com.taskflow.userservice.exception.UserNotFoundException;
import com.taskflow.userservice.repository.UserRepository;
import com.taskflow.userservice.security.CustomUserDetails;
import com.taskflow.userservice.security.JwtService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final S3Service s3Service;

    @Value("${admin.secret-key}")
    private String adminSecretKey;

    // Public self-registration. Always creates a MEMBER, regardless of
    // anything the caller sends - role escalation only happens through
    // registerAdmin (secret-key bootstrap) or promoteToAdmin (existing
    // admin only). This is what /api/users/register calls.
    @Transactional
    public UserResponse register(CreateUserRequest request) {
        return createUser(request, Role.MEMBER);
    }

    // Not reachable from the UI - this is the one path that can create an
    // ADMIN account, gated entirely by the shared secret key rather than
    // by an existing session, so it also works to bootstrap the very
    // first admin. Intended to be called directly (curl/Postman) by
    // whoever holds admin.secret-key, not exposed as a registration
    // option to end users.
    @Transactional
    public UserResponse registerAdmin(CreateUserRequest request) {
        if (request.getAdminSecretKey() == null || !request.getAdminSecretKey().equals(adminSecretKey)) {
            throw new InvalidAdminSecretKeyException("Invalid admin secret key");
        }
        return createUser(request, Role.ADMIN);
    }

    // Promotes an existing Member to Admin. The controller/SecurityConfig
    // restrict this to callers who are already authenticated as ADMIN, so
    // by the time this runs the caller's privilege has already been
    // checked - this method just does the write.
    @Transactional
    public UserResponse promoteToAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        user.setRole(Role.ADMIN);
        User updated = userRepository.save(user);
        log.info("Promoted user to ADMIN: {}", updated.getEmail());

        return toUserResponse(updated);
    }

    private UserResponse createUser(CreateUserRequest request, Role role) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Registered new user: {} ({})", savedUser.getEmail(), role);

        return toUserResponse(savedUser);
    }

    // Admin-only (enforced in SecurityConfig) - backs the Users admin
    // screen. Small dataset for this app, so no pagination.
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        String token = jwtService.generateToken(userDetails.getId(), userDetails.getEmail(), userDetails.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .expiresIn(jwtService.getExpiration())
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        User user = getAuthenticatedUser();
        return toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(UpdateUserRequest request) {
        User user = getAuthenticatedUser();
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        User updated = userRepository.save(user);
        return toUserResponse(updated);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getAuthenticatedUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", user.getEmail());
    }

    @Transactional
    public UserResponse updateProfileImage(MultipartFile file) {
        User user = getAuthenticatedUser();

        String previousImageUrl = user.getProfileImageUrl();

        String newImageUrl = s3Service.uploadFile(file);
        user.setProfileImageUrl(newImageUrl);
        User updated = userRepository.save(user);

        if (previousImageUrl != null) {
            String previousKey = s3Service.extractKeyFromUrl(previousImageUrl);
            if (previousKey != null) {
                s3Service.deleteFile(previousKey);
            }
        }

        return toUserResponse(updated);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UserNotFoundException("No authenticated user found");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}
