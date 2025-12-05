package com.kleff.userservice.presentation.models;

public record UserResponseModel(
        String authentikUid,
        String theme,
        String timezone,
        boolean marketingEmails
) {}
