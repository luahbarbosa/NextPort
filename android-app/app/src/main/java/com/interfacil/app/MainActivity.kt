package com.interfacil.app

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.interfacil.app.model.LoginRequest
import com.interfacil.app.network.RetrofitClient
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etSenha = findViewById<EditText>(R.id.etSenha)
        val btnLogin = findViewById<Button>(R.id.btnLogin)
        val tvErro = findViewById<TextView>(R.id.tvErro)

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString()
            val senha = etSenha.text.toString()

            if (email.isEmpty() || senha.isEmpty()) {
                tvErro.text = "Preencha todos os campos"
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    val response = RetrofitClient.auth().login(LoginRequest(email, senha))
                    // Login OK — salvar token e ir para a tela principal
                    val prefs = getSharedPreferences("interfacil", MODE_PRIVATE)
                    prefs.edit().putString("token", response.token).apply()
                    tvErro.text = "Login realizado com sucesso!"
                    tvErro.setTextColor(getColor(android.R.color.holo_green_dark))
                } catch (e: Exception) {
                    tvErro.text = "Erro: ${e.message}"
                }
            }
        }
    }
}