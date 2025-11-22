package com.dev.CursoOnline.service;

import com.dev.CursoOnline.model.Curso;
import java.util.List;
import java.util.Optional;

public interface CursoService {
    Curso guardarCurso(Curso curso);
    Optional<Curso> obtenerCursoPorId(Long id);
    List<Curso> listarCursos();
    void eliminarCurso(Long id);
}
