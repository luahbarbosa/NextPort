package com.interfacil.app.network

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

    // Use o IP da sua máquina no lugar de localhost (emulador não acessa localhost)
    private const val BASE_URL = "http://10.0.2.2:"

    fun auth(): ApiService = Retrofit.Builder()
        .baseUrl("${BASE_URL}3001/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ApiService::class.java)

    fun registro(): ApiService = Retrofit.Builder()
        .baseUrl("${BASE_URL}3002/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ApiService::class.java)
}