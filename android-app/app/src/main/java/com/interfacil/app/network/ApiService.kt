package com.interfacil.app.network

import com.interfacil.app.model.LoginRequest
import com.interfacil.app.model.LoginResponse
import com.interfacil.app.model.Residencia
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @GET("residencias")
    suspend fun listarResidencias(): List<Residencia>
}