package com.dev.CursoOnline.service;

import com.dev.CursoOnline.model.Usuario;
import java.util.List;
import java.util.Optional;

public interface UsuarioService {
    Usuario guardarUsuario(Usuario usuario);
    Optional<Usuario> obtenerUsuarioPorId(Long id);
    List<Usuario> listarUsuarios();
    void eliminarUsuario(Long id);
    Usuario obtenerPorEmail(String email); // <-- Agregado
}
