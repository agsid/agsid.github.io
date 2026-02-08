---
layout: page
title: Home
---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FLL Robot Code Editor</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; height: 100vh; margin: 0; background: #f0f2f5; }
        
        /* Layout Structure */
        #login-screen { display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; background: white; }
        #app-screen { display: none; width: 100%; height: 100%; flex-direction: row; }
        
        .sidebar { width: 35%; padding: 25px; display: flex; flex-direction: column; background: #ffffff; border-right: 1px solid #dee2e6; box-shadow: 2px 0 5px rgba(0,0,0,0.05); }
        .preview { width: 65%; padding: 20px; background: #212529; display: flex; flex-direction: column; align-items: center; justify-content: center; }

        /* Inputs & Buttons */
        textarea { flex-grow: 1; font-family: 'Fira Code', monospace; font-size: 14px; padding: 15px; border: 1px solid #ced4da; border-radius: 8px; resize: none; margin-bottom: 15px; outline: none; transition: border 0.2s; }
        textarea:focus { border-color: #007bff; }
        
        .controls { display: flex; gap: 10px; margin-bottom: 15px; }
        button { flex: 1; padding: 12px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 6px; font-weight: 600; transition: 0.2s; }
        button:hover { background: #0056b3; }
        button.secondary { background: #6c757d; }
        button.secondary:hover { background: #5a6268; }
        
        /* Simulation Visuals */
        canvas { background: #fff; border: 8px solid #495057; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .mat-label { color: #adb5bd; margin-top: 10px; font-size: 0.9rem; }
    </style>
</head>
<body>

    <div id="login-screen">
        <h2 style="margin-bottom: 20px;">🤖 Team Login</h2>
        <input type="email" id="email" placeholder="Email" style="padding:12px; margin:8px; width:280px; border:1px solid #ddd; border-radius:4px;">
        <input type="password" id="password" placeholder="Password" style="padding:12px; margin:8px; width:280px; border:1px solid #ddd; border-radius:4px;">
        <button onclick="handleLogin()" style="width: 280px; margin-top: 10px;">Enter Workshop</button>
    </div>

    <div id="app-screen">
        <div class="sidebar">
            <h3 style="margin-top: 0;">Command Center</h3>
            <div class="controls">
                <button class="secondary" onclick="setStart('left')">Start Left</button>
                <button class="secondary" onclick="setStart('right')">Start Right</button>
            </div>
            
            <p style="font-size: 0.85rem; color: #666;">
                Use: <code>drive(in)</code>, <code>turn(deg)</code>, <code>arm1.move()</code>
            </p>
            
            <textarea id="code-editor" placeholder="drive(20)&#10;turn(90)&#10;drive(10)" oninput="updatePreview()"></textarea>
            
            <div class="controls">
                <button onclick="saveCode()">💾 Save & Sync</button>
                <button class="secondary" onclick="exportPython()">📥 Download .py</button>
            </div>
            <div id="status" style="font-size: 0.9rem; color: #28a745; font-weight: bold; min-height: 20px;"></div>
        </div>

        <div class="preview">
            <h3 style="color:white; margin-bottom: 15px;">FLL Mat Live Preview</h3>
            <canvas id="fllMat" width="930" height="450"></canvas>
            <p class="mat-label">Table: 93" x 45" | Scale: 10px per inch</p>
        </div>
    </div>

    <script>
        // --- CONFIGURATION ---
        const SB_URL = 'https://wgy2n08b0i34.supabase.co';
        const SB_KEY = 'sb_publishable_WGy2N08B0i34_K84gtVDxw_5v4jm5NB';
        const supabase = window.supabase.createClient(SB_URL, SB_KEY);

        let currentUser = null;
        let currentTeamId = null;
        let currentFileId = null; 
        let startSide = 'left';

        // --- AUTH ---
        async function handleLogin() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) { alert(error.message); } 
            else { currentUser = data.user; initApp(); }
        }

        async function initApp() {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('app-screen').style.display = 'flex';
            
            const { data: members } = await supabase.from('team_members').select('team_id').eq('user_id', currentUser.id).single();
                
            if (members) {
                currentTeamId = members.team_id;
                loadTeamCode();
                setupRealtime();
            } else {
                alert("Team access error. Please contact your coach.");
            }
        }

        // --- DATABASE ---
        async function loadTeamCode() {
            let { data: files } = await supabase.from('code_files').select('*').eq('team_id', currentTeamId).limit(1);
            if (files && files.length > 0) {
                currentFileId = files[0].id;
                document.getElementById('code-editor').value = files[0].content;
                updatePreview();
            }
        }

        async function saveCode() {
            const content = document.getElementById('code-editor').value;
            const statusEl = document.getElementById('status');
            statusEl.innerText = "Syncing with team...";
            
            await supabase.from('code_files').update({ content, last_edited_by: currentUser.id }).eq('id', currentFileId);
            statusEl.innerText = "✓ Synced";
            setTimeout(() => statusEl.innerText = "", 2000);
        }

        function setupRealtime() {
            supabase.channel('team-code')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'code_files', filter: `team_id=eq.${currentTeamId}` }, 
            (payload) => {
                if (payload.new.last_edited_by !== currentUser.id) {
                    const editor = document.getElementById('code-editor');
                    editor.value = payload.new.content;
                    updatePreview();
                }
            }).subscribe();
        }

        // --- SIMULATOR ---
        function setStart(side) { startSide = side; updatePreview(); }

        function updatePreview() {
            const code = document.getElementById('code-editor').value;
            const canvas = document.getElementById('fllMat');
            const ctx = canvas.getContext('2d');
            const SCALE = 10; 

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Starting State
            let x = startSide === 'left' ? 10 : 83;
            let y = 22.5; 
            let angle = startSide === 'left' ? 0 : 180;

            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "#ccc";
            ctx.moveTo(x * SCALE, y * SCALE);

            const lines = code.split('\n');
            let collision = false;

            lines.forEach(line => {
                const cmd = line.trim();
                const driveMatch = cmd.match(/drive\(\s*(-?\d+)\s*\)/);
                const turnMatch = cmd.match(/turn\(\s*(-?\d+)\s*\)/);

                if (driveMatch) {
                    const dist = parseInt(driveMatch[1]);
                    const rad = angle * (Math.PI / 180);
                    x += dist * Math.cos(rad);
                    y += dist * Math.sin(rad);
                    ctx.lineTo(x * SCALE, y * SCALE);
                    if (x < 0 || x > 93 || y < 0 || y > 45) collision = true;
                }
                if (turnMatch) { angle += parseInt(turnMatch[1]); }
            });

            ctx.setLineDash([]);
            ctx.strokeStyle = collision ? '#ff4d4d' : '#007bff';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw Robot Marker
            ctx.fillStyle = collision ? '#ff4d4d' : '#28a745';
            ctx.beginPath();
            ctx.arc(x * SCALE, y * SCALE, 12, 0, Math.PI * 2);
            ctx.fill();
            
            if (collision) {
                ctx.fillStyle = 'white';
                ctx.font = 'bold 24px sans-serif';
                ctx.fillText("⚠️ WALL HIT", 20, 40);
            }
        }

        function exportPython() {
            const userCode = document.getElementById('code-editor').value;
            const processed = userCode.split('\n').map(l => {
                const t = l.trim();
                return (t.startsWith('drive') || t.startsWith('turn') || t.includes('move')) ? `    await ${t}` : `    ${t}`;
            }).join('\n');

            const blob = new Blob([`import hub\n\nasync def runloop():\n${processed}\n\nrunloop()`], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = "team_code.py";
            a.click();
        }
    </script>
</body>
</html>