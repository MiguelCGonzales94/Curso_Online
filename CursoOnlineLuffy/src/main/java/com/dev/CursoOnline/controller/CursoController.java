package com.dev.CursoOnline.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.CursoOnline.model.Curso;
import com.dev.CursoOnline.model.EstadoCurso;
import com.dev.CursoOnline.service.CursoService;

@RestController
@RequestMapping("/cursos")
public class CursoController {

    @Autowired
    private CursoService cursoService;

    @PostMapping
    public ResponseEntity<?> crearCurso(@RequestBody Curso curso) {
        try {
            // Validaciones
            if (curso.getTitulo() == null || curso.getTitulo().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El título es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }

            if (curso.getDescripcion() == null || curso.getDescripcion().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "La descripción es obligatoria");
                return ResponseEntity.badRequest().body(error);
            }

            // Si no se especifica estado, establecer PENDIENTE por defecto
            if (curso.getEstado() == null) {
                curso.setEstado(EstadoCurso.PENDIENTE);
            }

            System.out.println("Creando curso: " + curso);
            Curso cursoGuardado = cursoService.guardarCurso(curso);
            System.out.println("Curso guardado: " + cursoGuardado);

            return ResponseEntity.ok(cursoGuardado);
        } catch (Exception e) {
            System.err.println("Error al crear curso: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear el curso: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerCurso(@PathVariable("id") Long id) {
        try {
            Optional<Curso> curso = cursoService.obtenerCursoPorId(id);
            if (curso.isPresent()) {
                return ResponseEntity.ok(curso.get());
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Curso no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            System.err.println("Error al obtener curso: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener el curso: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCurso(@PathVariable("id") Long id, @RequestBody Curso curso) {
        try {
            Optional<Curso> cursoExistente = cursoService.obtenerCursoPorId(id);
            if (cursoExistente.isPresent()) {
                curso.setId(id);

                // Si no se especifica estado, mantener el existente
                if (curso.getEstado() == null) {
                    curso.setEstado(cursoExistente.get().getEstado());
                }

                Curso cursoActualizado = cursoService.guardarCurso(curso);
                return ResponseEntity.ok(cursoActualizado);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Curso no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            System.err.println("Error al actualizar curso: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar el curso: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> listarCursos() {
        try {
            List<Curso> cursos = cursoService.listarCursos();
            return ResponseEntity.ok(cursos);
        } catch (Exception e) {
            System.err.println("Error al listar cursos: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al listar cursos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCurso(@PathVariable("id") Long id) {
        try {
            Optional<Curso> curso = cursoService.obtenerCursoPorId(id);
            if (curso.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Curso no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            cursoService.eliminarCurso(id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Curso eliminado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error al eliminar curso: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar el curso: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}