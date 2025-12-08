package com.kleff.userservice.presentation.models;

public record UserResponseModel(
        String authentikUid,
        String name,
        String email,
        String phone,
        String theme,
        String timezone,
        boolean marketingEmails
) {}
