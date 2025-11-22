package com.dev.CursoOnline.service;

import com.dev.CursoOnline.model.Role;
import com.dev.CursoOnline.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public Role guardarRole(Role role) {
        return roleRepository.save(role);
    }

    @Override
    public Optional<Role> obtenerRolePorId(Long id) {
        return roleRepository.findById(id);
    }

    @Override
    public List<Role> listarRoles() {
        return roleRepository.findAll();
    }

    @Override
    public void eliminarRole(Long id) {
        roleRepository.deleteById(id);
    }
}
