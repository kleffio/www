package com.kleff.userservice.business;

import com.kleff.userservice.dataaccess.User;
import com.kleff.userservice.dataaccess.UserRepository;
import com.kleff.userservice.infrastructure.AuthentikApiService;
import com.kleff.userservice.mapper.UserRequestMapper;
import com.kleff.userservice.mapper.UserResponseMapper;
import com.kleff.userservice.presentation.models.UserRequestModel;
import com.kleff.userservice.presentation.models.UserResponseModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository repo;
    private final UserRequestMapper requestMapper;
    private final UserResponseMapper responseMapper;
    private final AuthentikApiService authentikApiService;

    public UserServiceImpl(UserRepository repo,
                           UserRequestMapper requestMapper,
                           UserResponseMapper responseMapper,
                           AuthentikApiService authentikApiService) {
        this.repo = repo;
        this.requestMapper = requestMapper;
        this.responseMapper = responseMapper;
        this.authentikApiService = authentikApiService;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseModel getCurrentUser(String authentikUid) {
        User user = repo.findById(authentikUid)
                .orElseGet(() -> repo.save(
                        requestMapper.toEntity(new UserRequestModel(null, null, null, "dark", null, false), authentikUid)
                ));

        return responseMapper.toModel(user);
    }

    @Override
    @Transactional
    public UserResponseModel updateCurrentUser(String authentikUid, String username, UserRequestModel request) {
        System.out.println("=== Updating User ===");
        System.out.println("Username: " + username);
        System.out.println("New name: " + request.name());
        
        User user = repo.findById(authentikUid)
                .orElseGet(() -> repo.save(
                        requestMapper.toEntity(new UserRequestModel(null, null, null, "dark", null, false), authentikUid)
                ));

        String oldName = user.getName();
        String oldEmail = user.getEmail();
        
        System.out.println("Old name: " + oldName);

        requestMapper.updateEntityFromRequest(request, user);
        repo.save(user);

        // Sync to Authentik if name or email changed
        if (request.name() != null && !request.name().equals(oldName)) {
            System.out.println("Name changed! Syncing to Authentik...");
            authentikApiService.updateUserName(username, request.name());
        } else {
            System.out.println("Name did NOT change");
        }
        
        if (request.email() != null && !request.email().equals(oldEmail)) {
            System.out.println("Email changed! Syncing to Authentik...");
            authentikApiService.updateUserEmail(username, request.email());
        }

        System.out.println("====================");

        return responseMapper.toModel(user);
    }

}
