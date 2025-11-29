package com.dev.CursoOnline.model;

public enum EstadoCurso {
    PENDIENTE,      // Curso creado por docente, esperando aprobación
    ACTIVO,         // Curso aprobado por admin, disponible para inscripción
    INACTIVO,       // Curso desactivado temporalmente
    COMPLETADO,     // Curso finalizado
    CANCELADO,      // Curso cancelado
    RECHAZADO       // Curso rechazado por admin
}