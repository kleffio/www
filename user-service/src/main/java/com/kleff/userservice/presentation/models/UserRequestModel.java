package com.kleff.userservice.presentation.models;

public record UserRequestModel(
        String theme,
        String timezone,
        Boolean marketingEmails
) {}
