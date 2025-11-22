package com.dev.CursoOnline.repository;

import com.dev.CursoOnline.model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CursoRepository extends JpaRepository<Curso, Long> {
}
