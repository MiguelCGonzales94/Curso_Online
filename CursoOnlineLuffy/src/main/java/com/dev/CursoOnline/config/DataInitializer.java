package com.dev.CursoOnline.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.dev.CursoOnline.model.Role;
import com.dev.CursoOnline.model.RoleName;
import com.dev.CursoOnline.repository.RoleRepository;
import com.dev.CursoOnline.model.Curso;
import com.dev.CursoOnline.model.EstadoCurso;
import com.dev.CursoOnline.repository.CursoRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;


@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private final RoleRepository roleRepository;
    @Autowired private CursoRepository cursoRepository;


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
