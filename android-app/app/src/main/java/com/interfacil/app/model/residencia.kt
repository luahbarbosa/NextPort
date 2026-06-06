package com.interfacil.app.model

data class Residencia(
    val id: Int,
    val nome: String,
    val numero: String,
    val dispositivos: List<Dispositivo> = emptyList()
)

data class Dispositivo(
    val id: Int,
    val nome: String,
    val token: String,
    val tipo: String,
    val residenciaId: Int?
)

data class LoginRequest(
    val email: String,
    val senha: String
)

data class LoginResponse(
    val token: String
)