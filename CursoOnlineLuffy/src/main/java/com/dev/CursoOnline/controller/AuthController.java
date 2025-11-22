// AuthController.java
package com.dev.CursoOnline.controller;

import com.dev.CursoOnline.model.Usuario;
import com.dev.CursoOnline.security.JwtUtil;
import com.dev.CursoOnline.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.dev.CursoOnline.model.Role;
import com.dev.CursoOnline.model.RoleName;
import com.dev.CursoOnline.repository.RoleRepository;
import java.util.Optional;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");
        Usuario usuario = usuarioService.obtenerPorEmail(email);

        Map<String, String> response = new HashMap<>();
        if (usuario != null && passwordEncoder.matches(password, usuario.getPassword())) {
            String token = jwtUtil.generateToken(usuario.getEmail());
            response.put("token", token);
        } else {
            response.put("error", "Credenciales inválidas");
        }
        return response;
    }

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> userData) {
        String email = userData.get("email");
        String password = userData.get("password");
        String nombre = userData.get("nombre");
        String roleStr = userData.get("role");
        Map<String, String> response = new HashMap<>();
        if (usuarioService.obtenerPorEmail(email) != null) {
            response.put("error", "El usuario ya existe");
            return response;
        }
        if (password == null || password.length() < 4) {
            response.put("error", "La contraseña debe tener al menos 4 caracteres");
            return response;
        }
        if (nombre == null || nombre.trim().isEmpty()) {
            response.put("error", "El nombre es obligatorio");
            return response;
        }
        if (roleStr == null || roleStr.trim().isEmpty()) {
            response.put("error", "El rol es obligatorio");
            return response;
        }
        RoleName roleName;
        try {
            roleName = RoleName.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            response.put("error", "Rol inválido");
            return response;
        }
        Optional<Role> roleOpt = roleRepository.findByRoleName(roleName);
        if (roleOpt.isEmpty()) {
            response.put("error", "Rol no encontrado en la base de datos");
            return response;
        }
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setNombre(nombre);
        usuario.setRole(roleOpt.get());
        usuarioService.guardarUsuario(usuario);
        response.put("message", "Usuario registrado correctamente");
        return response;
    }
}