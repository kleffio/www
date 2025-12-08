package com.kleff.userservice.business;

import com.kleff.userservice.presentation.models.UserRequestModel;
import com.kleff.userservice.presentation.models.UserResponseModel;

public interface UserService {
    UserResponseModel getCurrentUser(String authentikUid);
    UserResponseModel updateCurrentUser(String authentikUid, String username, UserRequestModel request);
}