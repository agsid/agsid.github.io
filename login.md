---
layout: page
title: Login
---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Robot Workspace - Login</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f2f5; }
        .auth-container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 320px; text-align: center; }
        input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .toggle-link { margin-top: 15px; font-size: 0.9rem; color: #666; cursor: pointer; text-decoration: underline; }
    </style>
</head>
<body>

    <div class="auth-container">
        <h2 id="auth-title">Team Login</h2>
        <input type="email" id="email" placeholder="Email">
        <input type="password" id="password" placeholder="Password">
        <button id="auth-button" onclick="handleAuth()">Login</button>
        <div class="toggle-link" id="toggle-auth" onclick="toggleMode()">Need an account? Sign Up</div>
        <p id="msg" style="font-size: 0.8rem; color: red;"></p>
    </div>

    <script>
        const SB_URL = 'https://wgy2n08b0i34.supabase.co';
        const SB_KEY = 'sb_publishable_WGy2N08B0i34_K84gtVDxw_5v4jm5NB';
        const supabase = window.supabase.createClient(SB_URL, SB_KEY);

        let isLogin = true;

        function toggleMode() {
            isLogin = !isLogin;
            document.getElementById('auth-title').innerText = isLogin ? 'Team Login' : 'Team Sign Up';
            document.getElementById('auth-button').innerText = isLogin ? 'Login' : 'Sign Up';
            document.getElementById('toggle-auth').innerText = isLogin ? 'Need an account? Sign Up' : 'Have an account? Login';
        }

        async function handleAuth() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const msg = document.getElementById('msg');

            const { data, error } = isLogin 
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ email, password });

            if (error) {
                msg.innerText = error.message;
            } else {
                // Redirect to the main editor
                window.location.href = 'index.html';
            }
        }
    </script>
</body>
</html>