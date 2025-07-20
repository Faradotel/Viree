"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email et mot de passe requis" }
  }

  try {
    // Vérifier l'utilisateur dans notre table custom
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("email", email).single()

    if (userError || !user) {
      return { success: false, error: "Email ou mot de passe incorrect" }
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return { success: false, error: "Email ou mot de passe incorrect" }
    }

    // Vérifier si le compte est actif
    if (!user.is_active) {
      return { success: false, error: "Compte désactivé" }
    }

    // Créer une session personnalisée
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours

    const { error: sessionError } = await supabase.from("user_sessions").insert({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Session creation error:", sessionError)
      return { success: false, error: "Erreur lors de la création de session" }
    }

    // Mettre à jour la dernière connexion
    await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", user.id)

    // Définir le cookie de session
    const cookieStore = await cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    })

    return { success: true, user: { id: user.id, email: user.email, username: user.username } }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Erreur lors de la connexion" }
  }
}

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const location = formData.get("location") as string

  if (!email || !username || !password || !firstName || !lastName) {
    return { success: false, error: "Tous les champs obligatoires doivent être remplis" }
  }

  if (password.length < 8) {
    return { success: false, error: "Le mot de passe doit contenir au moins 8 caractères" }
  }

  try {
    // Vérifier si l'email existe déjà
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return { success: false, error: "Cet email est déjà utilisé" }
    }

    // Vérifier si le nom d'utilisateur existe déjà
    const { data: existingUsername } = await supabase.from("users").select("id").eq("username", username).single()

    if (existingUsername) {
      return { success: false, error: "Ce nom d'utilisateur est déjà pris" }
    }

    // Hasher le mot de passe
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Créer l'utilisateur
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email,
        username,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        location: location || null,
        is_verified: false,
        is_active: true,
      })
      .select()
      .single()

    if (createError) {
      console.error("User creation error:", createError)
      return { success: false, error: "Erreur lors de la création du compte" }
    }

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Erreur lors de la création du compte" }
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (sessionToken) {
      // Supprimer la session de la base de données
      await supabase.from("user_sessions").delete().eq("session_token", sessionToken)
    }

    // Supprimer le cookie
    cookieStore.delete("session_token")
  } catch (error) {
    console.error("Logout error:", error)
  }
}
