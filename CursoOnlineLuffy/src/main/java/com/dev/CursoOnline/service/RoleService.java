package com.dev.CursoOnline.service;

import com.dev.CursoOnline.model.Role;
import java.util.List;
import java.util.Optional;

public interface RoleService {
    Role guardarRole(Role role);
    Optional<Role> obtenerRolePorId(Long id);
    List<Role> listarRoles();
    void eliminarRole(Long id);
}
