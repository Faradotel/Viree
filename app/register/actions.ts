"use server"

import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const username = formData.get("username") as string

  if (!email || !password || !firstName || !lastName || !username) {
    return {
      success: false,
      error: "Tous les champs sont requis",
    }
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "Le mot de passe doit contenir au moins 8 caractères",
    }
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("email, username")
      .or(`email.eq.${email},username.eq.${username}`)
      .single()

    if (existingUser) {
      if (existingUser.email === email) {
        return {
          success: false,
          error: "Un compte avec cet email existe déjà",
        }
      }
      if (existingUser.username === username) {
        return {
          success: false,
          error: "Ce nom d'utilisateur est déjà pris",
        }
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return {
        success: false,
        error: "Erreur lors de la création du compte",
      }
    }

    // Create user in our users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user?.id,
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        username,
        is_verified: false,
      })
      .select()
      .single()

    if (userError) {
      console.error("User creation error:", userError)
      return {
        success: false,
        error: "Erreur lors de la création du profil",
      }
    }

    return {
      success: true,
      user: userData,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: "Erreur serveur",
    }
  }
}
