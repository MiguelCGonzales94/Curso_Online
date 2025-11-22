package com.dev.CursoOnline.repository;

import com.dev.CursoOnline.model.Role;
import com.dev.CursoOnline.model.RoleName;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleName(RoleName roleName);
}