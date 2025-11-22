package com.dev.CursoOnline.service;

import com.dev.CursoOnline.model.CursoRegistro;
import com.dev.CursoOnline.repository.CursoRegistroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CursoRegistroServiceImpl implements CursoRegistroService {

    @Autowired
    private CursoRegistroRepository cursoRegistroRepository;

    @Override
    public CursoRegistro guardarCursoRegistro(CursoRegistro cursoRegistro) {
        return cursoRegistroRepository.save(cursoRegistro);
    }

    @Override
    public Optional<CursoRegistro> obtenerCursoRegistroPorId(Long id) {
        return cursoRegistroRepository.findById(id);
    }

    @Override
    public List<CursoRegistro> listarCursoRegistros() {
        return cursoRegistroRepository.findAll();
    }

    @Override
    public void eliminarCursoRegistro(Long id) {
        cursoRegistroRepository.deleteById(id);
    }
}
