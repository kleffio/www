package com.kleff.userservice.presentation;

import com.kleff.userservice.business.UserService;
import com.kleff.userservice.presentation.models.UserRequestModel;
import com.kleff.userservice.presentation.models.UserResponseModel;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private String getAuthentikUid(Jwt jwt) {
        String sub = jwt.getClaimAsString("sub");
        return sub != null ? sub : jwt.getClaimAsString("uid");
    }
    
    private String getUsername(Jwt jwt) {
        return jwt.getClaimAsString("preferred_username");
    }

    @GetMapping("/me")
    public UserResponseModel getMe(@AuthenticationPrincipal Jwt jwt) {
        return this.userService.getCurrentUser(getAuthentikUid(jwt));
    }

    @PutMapping("/me")
    public UserResponseModel updateMe(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody UserRequestModel request
    ) {
        return this.userService.updateCurrentUser(getAuthentikUid(jwt), getUsername(jwt), request);
    }
}