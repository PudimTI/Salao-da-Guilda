<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserPreference;
use App\Models\UserFilter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisterController extends Controller
{
    public function showRegistrationForm()
    {
        return view('auth.register-react');
    }

    public function register(Request $request)
    {
        $request->validate([
            'handle' => 'required|string|max:50|unique:users,handle',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'display_name' => 'required|string|max:100',
            'bio' => 'nullable|string|max:500',
        ]);

        $user = User::create([
            'handle' => $request->handle,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'display_name' => $request->display_name,
            'bio' => $request->bio,
            'status' => 'active',
        ]);

        // Criar perfil do usuário (apenas user_id, outros campos estão na tabela users)
        UserProfile::create([
            'user_id' => $user->id,
        ]);

        // Criar preferências padrão
        UserPreference::create([
            'user_id' => $user->id,
            'systems' => [],
            'styles' => [],
            'dynamics' => [],
        ]);

        // Criar filtros padrão
        UserFilter::create([
            'user_id' => $user->id,
            'whitelist_tags' => [],
            'blacklist_tags' => [],
        ]);

        Auth::login($user);

        return redirect('/')->with('success', 'Conta criada com sucesso!');
    }
}
