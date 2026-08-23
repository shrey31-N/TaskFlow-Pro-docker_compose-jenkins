package com.taskflow.projectservice.dto;

import com.taskflow.projectservice.entity.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Status is required")
    private ProjectStatus status;

    @NotNull(message = "Owner id is required")
    private Long ownerId;
}
