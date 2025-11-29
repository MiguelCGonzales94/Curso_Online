package com.dev.CursoOnline.controller;

import com.dev.CursoOnline.model.Curso;
import com.dev.CursoOnline.model.EstadoCurso;
import com.dev.CursoOnline.service.CursoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/cursos/aprobacion")
public class CursoAprobacionController {

    @Autowired
    private CursoService cursoService;

    // Obtener todos los cursos pendientes de aprobación
    @GetMapping("/pendientes")
    public ResponseEntity<List<Curso>> listarCursosPendientes() {
        List<Curso> cursos = cursoService.listarCursos();
        List<Curso> cursosPendientes = cursos.stream()
                .filter(curso -> curso.getEstado() == EstadoCurso.PENDIENTE)
                .collect(Collectors.toList());
        return ResponseEntity.ok(cursosPendientes);
    }

    // Aprobar un curso
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<Map<String, String>> aprobarCurso(@PathVariable Long id) {
        Optional<Curso> cursoOpt = cursoService.obtenerCursoPorId(id);
        Map<String, String> response = new HashMap<>();

        if (cursoOpt.isEmpty()) {
            response.put("error", "Curso no encontrado");
            return ResponseEntity.notFound().build();
        }

        Curso curso = cursoOpt.get();

        if (curso.getEstado() != EstadoCurso.PENDIENTE) {
            response.put("error", "El curso no está en estado pendiente");
            return ResponseEntity.badRequest().body(response);
        }

        curso.setEstado(EstadoCurso.ACTIVO);
        cursoService.guardarCurso(curso);

        response.put("message", "Curso aprobado exitosamente");
        return ResponseEntity.ok(response);
    }

    // Rechazar un curso
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<Map<String, String>> rechazarCurso(@PathVariable Long id) {
        Optional<Curso> cursoOpt = cursoService.obtenerCursoPorId(id);
        Map<String, String> response = new HashMap<>();

        if (cursoOpt.isEmpty()) {
            response.put("error", "Curso no encontrado");
            return ResponseEntity.notFound().build();
        }

        Curso curso = cursoOpt.get();

        if (curso.getEstado() != EstadoCurso.PENDIENTE) {
            response.put("error", "El curso no está en estado pendiente");
            return ResponseEntity.badRequest().body(response);
        }

        curso.setEstado(EstadoCurso.RECHAZADO);
        cursoService.guardarCurso(curso);

        response.put("message", "Curso rechazado");
        return ResponseEntity.ok(response);
    }

    // Obtener estadísticas de cursos
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Long>> obtenerEstadisticas() {
        List<Curso> cursos = cursoService.listarCursos();
        Map<String, Long> estadisticas = new HashMap<>();

        estadisticas.put("pendientes", cursos.stream()
                .filter(c -> c.getEstado() == EstadoCurso.PENDIENTE).count());
        estadisticas.put("aprobados", cursos.stream()
                .filter(c -> c.getEstado() == EstadoCurso.ACTIVO).count());
        estadisticas.put("rechazados", cursos.stream()
                .filter(c -> c.getEstado() == EstadoCurso.RECHAZADO).count());

        return ResponseEntity.ok(estadisticas);
    }
}