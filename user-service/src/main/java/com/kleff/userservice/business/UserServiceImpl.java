package com.kleff.userservice.business;

import com.kleff.userservice.dataaccess.User;
import com.kleff.userservice.dataaccess.UserRepository;
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

    public UserServiceImpl(UserRepository repo,
                           UserRequestMapper requestMapper,
                           UserResponseMapper responseMapper) {
        this.repo = repo;
        this.requestMapper = requestMapper;
        this.responseMapper = responseMapper;
    }

    private User getOrCreateEntity(String authentikUid) {
        return repo.findById(authentikUid).orElseGet(() -> {
            User user = User.builder()
                    .authentikUid(authentikUid)
                    .theme("dark")
                    .marketingEmails(false)
                    .build();
            return repo.save(user);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseModel getCurrentUser(String authentikUid) {
        User user = repo.findById(authentikUid)
                .orElseGet(() -> repo.save(
                        requestMapper.toEntity(new UserRequestModel("dark", null, false), authentikUid)
                ));

        return responseMapper.toModel(user);
    }

    @Override
    @Transactional
    public UserResponseModel updateCurrentUser(String authentikUid, UserRequestModel request) {
        User user = repo.findById(authentikUid)
                .orElseGet(() -> repo.save(
                        requestMapper.toEntity(new UserRequestModel("dark", null, false), authentikUid)
                ));

        requestMapper.updateEntityFromRequest(request, user);
        repo.save(user);

        return responseMapper.toModel(user);
    }

}
