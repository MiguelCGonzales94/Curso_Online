package com.dev.CursoOnline.service;

import com.dev.CursoOnline.model.CursoRegistro;
import java.util.List;
import java.util.Optional;

public interface CursoRegistroService {
    CursoRegistro guardarCursoRegistro(CursoRegistro cursoRegistro);
    Optional<CursoRegistro> obtenerCursoRegistroPorId(Long id);
    List<CursoRegistro> listarCursoRegistros();
    void eliminarCursoRegistro(Long id);
}
