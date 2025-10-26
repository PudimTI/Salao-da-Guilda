<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordReset;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;

class PasswordResetController extends Controller
{
    public function showForgotPasswordForm()
    {
        return view('auth.forgot-password');
    }

    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            // Invalidar tokens anteriores
            PasswordReset::where('user_id', $user->id)->update(['used' => true]);

            // Criar novo token
            $token = Str::random(60);
            PasswordReset::create([
                'user_id' => $user->id,
                'token' => $token,
                'expires_at' => now()->addHours(1),
            ]);

            // Aqui você implementaria o envio do email
            // Mail::to($user->email)->send(new PasswordResetMail($token));
        }

        return back()->with('status', 'Se o email existir, você receberá um link de redefinição.');
    }

    public function showResetForm(Request $request, $token)
    {
        $passwordReset = PasswordReset::where('token', $token)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$passwordReset) {
            return redirect('/login')->with('error', 'Token inválido ou expirado.');
        }

        return view('auth.reset-password', ['token' => $token]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $passwordReset = PasswordReset::where('token', $request->token)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$passwordReset) {
            return back()->withErrors(['email' => 'Token inválido ou expirado.']);
        }

        $user = User::find($passwordReset->user_id);

        if ($user->email !== $request->email) {
            return back()->withErrors(['email' => 'Email não confere.']);
        }

        $user->update(['password' => Hash::make($request->password)]);
        $passwordReset->update(['used' => true]);

        return redirect('/login')->with('status', 'Senha redefinida com sucesso!');
    }
}
