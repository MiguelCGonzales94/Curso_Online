package com.dev.CursoOnline.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.dev.CursoOnline.model.Role;
import com.dev.CursoOnline.model.RoleName;
import com.dev.CursoOnline.repository.RoleRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByRoleName(roleName).isEmpty()) {
                Role role = new Role();
                role.setRoleName(roleName);
                roleRepository.save(role);
            }
        }
    }
}
