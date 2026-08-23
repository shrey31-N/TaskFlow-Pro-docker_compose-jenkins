package com.taskflow.taskservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Local mirror of the response shape returned by user-service's
 * GET /api/users/{id}. Field names are matched exactly to user-service's
 * UserResponse (id, fullName, email, phone, role, profileImageUrl) to avoid
 * silent mapping bugs from Jackson's default property-name binding.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String profileImageUrl;
}
