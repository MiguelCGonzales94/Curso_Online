package com.dev.CursoOnline.controller;

import com.dev.CursoOnline.model.CursoRegistro;
import com.dev.CursoOnline.service.CursoRegistroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/cursoregistros")
public class CursoRegistroController {

    @Autowired
    private CursoRegistroService cursoRegistroService;

    @PostMapping
    public CursoRegistro crearCursoRegistro(@RequestBody CursoRegistro cursoRegistro) {
        return cursoRegistroService.guardarCursoRegistro(cursoRegistro);
    }

    @GetMapping("/{id}")
    public Optional<CursoRegistro> obtenerCursoRegistro(@PathVariable Long id) {
        return cursoRegistroService.obtenerCursoRegistroPorId(id);
    }

    @GetMapping
    public List<CursoRegistro> listarCursoRegistros() {
        return cursoRegistroService.listarCursoRegistros();
    }

    @DeleteMapping("/{id}")
    public void eliminarCursoRegistro(@PathVariable Long id) {
        cursoRegistroService.eliminarCursoRegistro(id);
    }
}
