package com.dev.CursoOnline.controller;

import com.dev.CursoOnline.model.Role;
import com.dev.CursoOnline.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/roles")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @PostMapping
    public Role crearRole(@RequestBody Role role) {
        return roleService.guardarRole(role);
    }

    @GetMapping("/{id}")
    public Optional<Role> obtenerRole(@PathVariable Long id) {
        return roleService.obtenerRolePorId(id);
    }

    @GetMapping
    public List<Role> listarRoles() {
        return roleService.listarRoles();
    }

    @DeleteMapping("/{id}")
    public void eliminarRole(@PathVariable Long id) {
        roleService.eliminarRole(id);
    }
}
