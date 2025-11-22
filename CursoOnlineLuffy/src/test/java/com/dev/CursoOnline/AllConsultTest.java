package com.dev.CursoOnline;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.junit.jupiter.api.Test;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;


@SpringBootTest
@AutoConfigureMockMvc
public class AllConsultTest {

    @Autowired
    MockMvc mockMvc;

    private String generateTestToken() {
        // TODO: Implement token generation or use a static valid token for testing
        return "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsdWRrYW50Z2FsaW5kb0BlbWFpbC5jb20iLCJpYXQiOjE3NjAxMTMzMTcsImV4cCI6MTc2MDE5OTcxN30.5iUMQWAScpsz8d-dm-dh54N3Vwyman1orUxIzX0DYgg";
    }

    
    @Test
    public void testConsultarRoles() throws Exception {
        mockMvc.perform(get("/roles")
                .header("Authorization", "Bearer " + generateTestToken()))
            .andExpect(status().isOk())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testConsultarUsuarios() throws Exception {
        mockMvc.perform(get("/usuarios")
                .header("Authorization", "Bearer " + generateTestToken()))
            .andExpect(status().isOk())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testConsultarCursos() throws Exception {
        mockMvc.perform(get("/cursos")
                .header("Authorization", "Bearer " + generateTestToken()))
            .andExpect(status().isOk())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testConsultarCursoRegistros() throws Exception {
        mockMvc.perform(get("/cursoregistros")
                .header("Authorization", "Bearer " + generateTestToken()))
            .andExpect(status().isOk())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testCrearRole() throws Exception {
        String json = "{\"nombre\":\"ADMIN\"}";
        mockMvc.perform(post("/roles")
                .header("Authorization", "Bearer " + generateTestToken())
                .contentType("application/json")
                .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("ADMIN"));
    }

    @Test
    public void testCrearUsuario() throws Exception {
        String json = "{\"nombre\":\"Juan\",\"email\":\"juan@email.com\"}";
        mockMvc.perform(post("/usuarios")
                .header("Authorization", "Bearer " + generateTestToken())
                .contentType("application/json")
                .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("Juan"));
    }

    @Test
    public void testCrearCurso() throws Exception {
        String json = "{\"nombre\":\"Matemáticas\",\"descripcion\":\"Curso básico\"}";
        mockMvc.perform(post("/cursos")
                .header("Authorization", "Bearer " + generateTestToken())
                .contentType("application/json")
                .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("Matemáticas"));
    }

    @Test
    public void testCrearCursoRegistro() throws Exception {
        String json = "{\"usuarioId\":1,\"cursoId\":1}";
        mockMvc.perform(post("/cursoregistros")
                .header("Authorization", "Bearer " + generateTestToken())
                .contentType("application/json")
                .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.usuarioId").value(1));
    }
    
}
